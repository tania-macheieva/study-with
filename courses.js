const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const storage = require('./course-creation/storage-config');
 
const upload = multer({ storage }).any();
  
  router.post('/save-draft', upload, async (req, res) => {  
    const courseThumbnail = req.files.find(file => file.fieldname === 'course_thumbnail')?.filename || null;
    const {
      course_title = '',
      course_description = '',
      course_price = '',
      course_category = null,
      education_level = null,
      author_id,
      modules,
      tags,
      course_id, 
      test_link = '',
    } = req.body;
    console.log('Course_data:', req.body);
    let parsedCoursePrice = course_price ? parseFloat(course_price) : null;
    let parsedCourseCategory = course_category ? parseInt(course_category, 10) : null;
    let parsedEducationLevel = education_level ? parseInt(education_level, 10) : null;
  
    if (isNaN(parsedCoursePrice)) parsedCoursePrice = null;
    if (isNaN(parsedCourseCategory)) parsedCourseCategory = null;
    if (isNaN(parsedEducationLevel)) parsedEducationLevel = null;
    
    if (!author_id) {
      return res.status(400).json({ success: false, message: 'Author ID is required!' });
    }
  
    let parsedTags = tags;
    if (tags && typeof tags === 'string') {
      parsedTags = [...new Set(tags.split(',').map(tag => tag.trim()))];
    }
  
    try {
      let courseId = course_id;  
      let courseToUpdate;
  
      const courseCheckQuery = `
        SELECT id, name, description, price, category_id, image_url, education_level_id, status, test_link
        FROM all_courses
        WHERE author_id = $1 AND (name = $2 OR description = $3)
      `;
      const courseCheckResult = await pool.query(courseCheckQuery, [author_id, course_title, course_description]);
  
      if (courseCheckResult.rows.length > 0) {
        courseToUpdate = courseCheckResult.rows[0];
  
        if (courseToUpdate.status === 'published') {
          // Якщо курс вже опублікований, просто оновлюємо дані без зміни статусу
          const updateQuery = `
            UPDATE all_courses
            SET
              name = COALESCE($1, name),
              description = COALESCE($2, description),
              price = COALESCE($3, price),
              category_id = COALESCE($4, category_id),
              image_url = COALESCE($5, image_url),
              education_level_id = COALESCE($6, education_level_id),
              test_link = COALESCE($7, test_link)
            WHERE id = $8;
          `;
          const updateValues = [
            course_title || courseToUpdate.name,
            course_description || courseToUpdate.description,
            parsedCoursePrice || courseToUpdate.price,
            parsedCourseCategory || courseToUpdate.category_id,
            courseThumbnail || courseToUpdate.image_url,
            parsedEducationLevel || courseToUpdate.education_level_id,
            test_link || courseToUpdate.test_link,
            courseToUpdate.id
          ];
  
          await pool.query(updateQuery, updateValues);
          courseId = courseToUpdate.id;
        } else {
          // Якщо курс є в чернетці або взагалі відсутній, оновлюємо статус на "draft"
          const updateQuery = `
            UPDATE all_courses
            SET
              name = COALESCE($1, name),
              description = COALESCE($2, description),
              price = COALESCE($3, price),
              category_id = COALESCE($4, category_id),
              image_url = COALESCE($5, image_url),
              education_level_id = COALESCE($6, education_level_id),
              status = 'draft',
              test_link =  COALESCE($7, test_link)
            WHERE id = $8;
          `;
          const updateValues = [
            course_title || courseToUpdate.name,
            course_description || courseToUpdate.description,
            parsedCoursePrice || courseToUpdate.price,
            parsedCourseCategory || courseToUpdate.category_id,
            courseThumbnail || courseToUpdate.image_url,
            parsedEducationLevel || courseToUpdate.education_level_id,
            test_link || courseToUpdate.test_link,
            courseToUpdate.id
          ];
  
          await pool.query(updateQuery, updateValues);
          courseId = courseToUpdate.id;
        }
      } else {
        // Якщо курсу немає, створюємо новий курс зі статусом "draft"
        const query = `
          INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id, status, test_link)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8)
          RETURNING id;
        `;
        const result = await pool.query(query, [
          course_title,
          course_description,
          parsedCoursePrice,
          parsedCourseCategory,
          courseThumbnail,
          author_id,
          parsedEducationLevel,
          test_link,
        ]);
        courseId = result.rows[0].id;
      }
  
      // Update or insert modules
      if (modules && modules !== 'undefined' && modules !== null) {
        let modulesArray = [];
        try {
          modulesArray = JSON.parse(modules);
        } catch (err) {
          return res.status(400).json({ success: false, message: 'Invalid modules data!' });
        }
  
        const existingModulesResult = await pool.query(
          `SELECT id FROM modules WHERE course_id = $1`,
          [courseId]
        );
        const existingModuleIds = existingModulesResult.rows.map(row => row.id);
  
        const newModuleIds = modulesArray.map(module => module.id).filter(id => id !== undefined);
  
        const modulesToDelete = existingModuleIds.filter(id => !newModuleIds.includes(id));
  
        if (modulesToDelete.length > 0) {
          await pool.query(`DELETE FROM lecture_files WHERE lecture_id IN (SELECT id FROM lectures WHERE module_id = ANY($1::int[]))`, [modulesToDelete]);
          await pool.query(`DELETE FROM lectures WHERE module_id = ANY($1::int[])`, [modulesToDelete]);
          await pool.query(`DELETE FROM modules WHERE id = ANY($1::int[])`, [modulesToDelete]);
        }
  
        const modulePromises = modulesArray.map(async (module) => {
          const { id, title, order_num, lectures: moduleLectures, test_link: moduleTestLink } = module;
  
          if (!title || !order_num) {
            throw new Error('Module must have a title and order_num.');
          }
          let moduleId = id;
  
          if (!moduleId) {
            const moduleResult = await pool.query(
              `INSERT INTO modules (course_id, title, order_num, test_link) VALUES ($1, $2, $3, $4) RETURNING id`,
              [courseId, title, order_num, moduleTestLink || null] 
            );
            
            moduleId = moduleResult.rows[0].id;
          } else {
            await pool.query(
              `UPDATE modules SET title = $1, test_link = COALESCE($2, test_link) WHERE id = $3`,
              [title, moduleTestLink, moduleId]
            );  
          }
  
          if (moduleLectures && Array.isArray(moduleLectures)) {
            const lecturePromises = moduleLectures.map(async (lecture, index) => {
              const { id: lectureId, title, description } = lecture;
              if (lectureId) {
                await pool.query(
                  `UPDATE lectures SET title = $1, description = $2 WHERE id = $3`,
                  [title, description, lectureId]
                );
              } else {
                const lectureResult = await pool.query(
                  `INSERT INTO lectures (module_id, title, description, order_num) VALUES ($1, $2, $3, $4) RETURNING id`,
                  [moduleId, title, description, index + 1]
              );
              const lectureId = lectureResult.rows[0].id;
              
              if (req.files && req.files['lecture_files']) {
                  const lectureFiles = req.files['lecture_files'].filter(file => 
                      file.fieldname === `lecture_files_${index}`
                  );
              
                  if (lectureFiles.length > 0) {
                      await pool.query('DELETE FROM lecture_files WHERE lecture_id = $1', [lectureId]);
              
                      for (const file of lectureFiles) {
                          await pool.query(
                              `INSERT INTO lecture_files (lecture_id, file_name, file_url, file_type)
                               VALUES ($1, $2, $3, $4)`,
                              [
                                  lectureId,
                                  file.originalname,
                                  file.path,
                                  file.mimetype
                              ]
                          );
                      }
                  }
              }
                }
            });
  
            await Promise.all(lecturePromises);
          }
        });
  
        await Promise.all(modulePromises);
      }
  
      // Update or insert tags
      if (parsedTags && Array.isArray(parsedTags)) {
        const deleteTagsQuery = `
          DELETE FROM course_tags
          WHERE course_id = $1;
        `;
        await pool.query(deleteTagsQuery, [courseId]);
  
        const insertTagsQuery = `
          INSERT INTO tags (name)
          SELECT * FROM (VALUES ${parsedTags.map((_, i) => `($${i + 1})`).join(', ')}) AS t(name)
          ON CONFLICT(name) DO NOTHING;
        `;
        await pool.query(insertTagsQuery, parsedTags);
  
        const selectTagIdsQuery = `
          SELECT id FROM tags WHERE name = ANY($1);
        `;
        const tagIdsResult = await pool.query(selectTagIdsQuery, [parsedTags]);
  
        const courseTagPromises = tagIdsResult.rows.map(tag => {
          return pool.query(
            `INSERT INTO course_tags (course_id, tag_id)
            SELECT $1, $2
            WHERE NOT EXISTS (
              SELECT 1 FROM course_tags WHERE course_id = $1 AND tag_id = $2
            )`,
            [courseId, tag.id]
          );
        });
  
        await Promise.all(courseTagPromises);
      }
  
      return res.json({
        success: true,
        message: 'Draft saved successfully!',
        courseId,
        tags: parsedTags,
      });
    } catch (err) {
      console.error('Error saving draft:', err);
      return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
  });
  
router.post('/create', upload, async (req, res) => {
    const courseThumbnail = req.files.find(file => file.fieldname === 'course_thumbnail')?.filename || null;
    const {
        course_title,
        course_description,
        course_price,
        course_category,
        education_level,
        author_id,
        modules, 
        test_link,
    } = req.body;
    console.log('Create_course_data:', req.body);

    if (!course_title || !course_description || !course_price || !course_category || !education_level || !author_id) {
        return res.status(400).json({ success: false, message: 'Please fill all required fields!' });
    }

    let tags = req.body.tags;
    if (tags && typeof tags === 'string') {
        tags = tags.split(',').map(tag => tag.trim());
    }

    try {
        const categoryCheckQuery = 'SELECT id FROM categories WHERE id = $1 LIMIT 1';
        const categoryResult = await pool.query(categoryCheckQuery, [course_category]);

        if (categoryResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Category does not exist!' });
        }

        const educationLevelCheckQuery = 'SELECT id FROM education_levels WHERE id = $1 LIMIT 1';
        const educationLevelResult = await pool.query(educationLevelCheckQuery, [education_level]);

        if (educationLevelResult.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Education level does not exist!' });
        }

        
        const existingCourseQuery = `
            SELECT id, status FROM all_courses WHERE author_id = $1 AND name = $2
        `;
        const existingCourseResult = await pool.query(existingCourseQuery, [author_id, course_title]);

        let courseId;

        if (existingCourseResult.rows.length > 0) {
            
            const existingCourse = existingCourseResult.rows[0];
            courseId = existingCourse.id;

            const updateQuery = `
                UPDATE all_courses
                SET 
                    name = COALESCE($1, name),
                    description = COALESCE($2, description),
                    price = COALESCE($3, price),
                    category_id = COALESCE($4, category_id),
                    image_url = COALESCE($5, image_url),
                    education_level_id = COALESCE($6, education_level_id),
                    status = 'published',
                    test_link = COALESCE($7, test_link)
                WHERE id = $8
                RETURNING id;
            `;
            const updateValues = [
                course_title,
                course_description,
                course_price,
                categoryResult.rows[0].id,
                courseThumbnail,
                educationLevelResult.rows[0].id,
                test_link,
                courseId,
                
            ];

            await pool.query(updateQuery, updateValues);
        } else {
            
            const query = `
                INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id, status, test_link)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'published', $8)
                RETURNING id;
            `;
            const result = await pool.query(query, [
                course_title,
                course_description,
                course_price,
                categoryResult.rows[0].id,
                courseThumbnail,
                author_id,
                educationLevelResult.rows[0].id,
                test_link,
            ]);

            courseId = result.rows[0].id;
        }


        if (modules && modules !== 'undefined' && modules !== null) {
            let modulesArray = [];
            try {
              modulesArray = JSON.parse(modules);
            } catch (err) {
              return res.status(400).json({ success: false, message: 'Invalid modules data!' });
            }
          
            
            const existingModulesResult = await pool.query(
              `SELECT id FROM modules WHERE course_id = $1`,
              [courseId]
            );
            const existingModuleIds = existingModulesResult.rows.map(row => row.id);
          
            
            const newModuleIds = modulesArray.map(module => module.id).filter(id => id !== undefined);
          
            
            const modulesToDelete = existingModuleIds.filter(id => !newModuleIds.includes(id));
          
            if (modulesToDelete.length > 0) {
              
              await pool.query(`DELETE FROM lecture_files WHERE lecture_id IN (SELECT id FROM lectures WHERE module_id = ANY($1::int[]))`, [modulesToDelete]);
              await pool.query(`DELETE FROM lectures WHERE module_id = ANY($1::int[])`, [modulesToDelete]);
          
              
              await pool.query(`DELETE FROM modules WHERE id = ANY($1::int[])`, [modulesToDelete]);
            }
          
            
            const modulePromises = modulesArray.map(async (module) => {
              const { id, title, order_num, lectures: moduleLectures, test_link: moduleTestLink } = module;
              console.log('moduleTestLink before update:', moduleTestLink); // додаткове логування

              console.log('Module_data:', module);
          
              if (!title || !order_num) {
                  throw new Error('Module must have a title and order_num.');
              }
          
              const existingModuleResult = await pool.query(
                  `SELECT id FROM modules WHERE course_id = $1 AND order_num = $2`,
                  [courseId, order_num]
              );
          
              let moduleId = null;
              if (existingModuleResult.rows.length > 0) {
                  moduleId = existingModuleResult.rows[0].id;
          
                  // Додаємо лог перед оновленням
                  console.log('moduleTestLink:', moduleTestLink);
          
                  await pool.query(
                    `UPDATE modules 
                     SET title = $1, 
                         test_link = $2 
                     WHERE id = $3`,
                    [title, moduleTestLink, moduleId]
                );
                  
          
              } else {
                  const moduleResult = await pool.query(
                      `INSERT INTO modules (course_id, title, order_num, test_link) 
                       VALUES ($1, $2, $3, $4) RETURNING id`,
                      [courseId, title, order_num, moduleTestLink || null]
                  );
                  moduleId = moduleResult.rows[0].id;
              } 
          
            
              if (moduleLectures && Array.isArray(moduleLectures)) {
                const lecturePromises = moduleLectures.map(async (lecture, index) => {
                  const { id: lectureId, title, description } = lecture;
          
                  if (lectureId) {
                    
                    await pool.query(
                      `UPDATE lectures SET title = $1, description = $2 WHERE id = $3`,
                      [title, description, lectureId]
                    );
                  } else {
                    
                    const lectureResult = await pool.query(
                        `INSERT INTO lectures (module_id, title, description, order_num) VALUES ($1, $2, $3, $4) RETURNING id`,
                        [moduleId, title, description, index + 1]
                      );
                      const lectureId = lectureResult.rows[0].id;
                      
    
    
                    
                      const lectureFileKey = `lecture_files_${index}`;
                      const filesForThisLecture = Object.values(req.files).filter(file => 
                          file.fieldname === lectureFileKey
                      );
                      
                      if (filesForThisLecture && filesForThisLecture.length > 0) {
                          await pool.query('DELETE FROM lecture_files WHERE lecture_id = $1', [lectureId]);
                      
                          for (const file of filesForThisLecture) {
                              await pool.query(
                                  `INSERT INTO lecture_files (lecture_id, file_name, file_url, file_type)
                                   VALUES ($1, $2, $3, $4)`,
                                  [
                                      lectureId,
                                      file.originalname,
                                      file.path,
                                      file.mimetype
                                  ]
                              );
                          }
                      }
              }
            });
               
          
                await Promise.all(lecturePromises);
              }
            });
          
            await Promise.all(modulePromises);
          }
          

          if (tags && Array.isArray(tags)) {
            
            const existingTagsQuery = `
                SELECT t.name
                FROM tags t
                JOIN course_tags ct ON t.id = ct.tag_id
                WHERE ct.course_id = $1;
            `;
            const existingTagsResult = await pool.query(existingTagsQuery, [courseId]);
            const existingTags = existingTagsResult.rows.map(row => row.name);
        
            
            const tagsToRemove = existingTags.filter(tag => !tags.includes(tag));
            const tagsToAdd = tags.filter(tag => !existingTags.includes(tag));
        
            
            if (tagsToRemove.length > 0) {
                const deleteTagsQuery = `
                    DELETE FROM course_tags
                    WHERE course_id = $1 AND tag_id IN (
                        SELECT id FROM tags WHERE name = ANY($2)
                    );
                `;
                await pool.query(deleteTagsQuery, [courseId, tagsToRemove]);
            }
        
            
            if (tagsToAdd.length > 0) {
                const insertTagsQuery = `
                    INSERT INTO tags (name)
                    SELECT * FROM (VALUES ${tagsToAdd.map((_, i) => `($${i + 1})`).join(', ')}) AS t(name)
                    ON CONFLICT(name) DO NOTHING
                    RETURNING id;
                `;
                const tagIds = await pool.query(insertTagsQuery, tagsToAdd);
        
                
                const courseTagPromises = tagIds.rows.map(tag => {
                    return pool.query(
                        `INSERT INTO course_tags (course_id, tag_id) VALUES ($1, $2)`,
                        [courseId, tag.id]
                    );
                });
        
                await Promise.all(courseTagPromises);
            }
        }        
        return res.json({
            success: true,
            message: 'Course created successfully!',
            courseId,
            tags,
        });
    } catch (err) {
        console.error('Error creating course:', err);
        return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
    }
});

////////
router.get('/', async (req, res) => {
  try {
      const { 
          search, 
          themes, 
          price_type,
          level,
          sort 
      } = req.query;

      let query = `
          SELECT c.*, 
                 u.name as author_name,
                 cat.name as category_name,
                 el.name as education_level,
                 COALESCE(
                     (SELECT COUNT(*) FROM saved_courses sc WHERE sc.course_id = c.id),
                     0
                 ) as popularity
          FROM all_courses c
          LEFT JOIN users u ON c.author_id = u.id
          LEFT JOIN categories cat ON c.category_id = cat.id
          LEFT JOIN education_levels el ON c.education_level_id = el.id
          WHERE c.status = 'published'
      `;

      const queryParams = [];
      let paramCount = 1;

      if (search) {
          queryParams.push(`%${search}%`);
          query += ` AND (c.name ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
          paramCount++;
      }

      if (themes) {
          const themesList = themes.split(',');
          queryParams.push(themesList);
          query += ` AND cat.name = ANY($${paramCount})`;
          paramCount++;
      }

      if (price_type === 'free') {
          query += ` AND c.price = 0`;
      } else if (price_type === 'paid') {
          query += ` AND c.price > 0`;
      }

      if (level) {
          const levelMap = {
              'level-basic': 'Basic level',
              'level-intermediate': 'Intermediate level',
              'level-advanced': 'Advanced level'
          };
          queryParams.push(levelMap[level]);
          query += ` AND el.name = $${paramCount}`;
          paramCount++;
      }

      if (sort === 'option1') { 
          query += ` ORDER BY c.price ASC`;
      } else if (sort === 'option2') { 
          query += ` ORDER BY popularity DESC`;
      }

      const result = await pool.query(query, queryParams);
      
      const formattedCourses = result.rows.map(course => ({
          id: course.id,  
          name: course.name,
          description: course.description,
          price: parseFloat(course.price),
          themes: [course.category_name],
          level: course.education_level.toLowerCase().replace(' level', ''),
          popularity: parseInt(course.popularity),
          image_url: course.image_url,
          author: course.author_name
      }));

      res.json(formattedCourses);
  } catch (err) {
      console.error('Error getting courses:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const query = `
          SELECT c.*, 
                 cat.name as category_name,
                 el.name as education_level
          FROM all_courses c
          LEFT JOIN categories cat ON c.category_id = cat.id
          LEFT JOIN education_levels el ON c.education_level_id = el.id
          WHERE c.id = $1 AND c.status = 'published'
      `;
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Course not found' });
      }

      const course = result.rows[0];
      res.json({
          id: course.id,
          name: course.name,
          description: course.description,
          price: parseFloat(course.price),
          category: course.category_name,
          level: course.education_level,
          duration: '6 weeks'
      });
  } catch (err) {
      console.error('Error getting course:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/full', async (req, res) => {
  try {
    const { id } = req.params;
      
    const query = `
      SELECT 
        c.*,
        cat.name as category_name,
        el.name as education_level,
        u.id as author_id,
        u.name as author_name,
        u.profile_image as author_profile_image,
        t.nickname as author_nickname,
        t.about as author_about,
        t.experience as author_experience,
        (
            SELECT json_agg(
                json_build_object(
                    'id', m.id,
                    'title', m.title,
                    'order_num', m.order_num,
                    'lectures', (
                        SELECT json_agg(
                            json_build_object(
                                'id', l.id,
                                'title', l.title,
                                'description', l.description,
                                'order_num', l.order_num
                            )
                            ORDER BY l.order_num
                        )
                        FROM lectures l
                        WHERE l.module_id = m.id
                    )
                )
                ORDER BY m.order_num
            )
            FROM modules m
            WHERE m.course_id = c.id
        ) as modules,(
          SELECT json_agg(
            json_build_object(
              'id', r.id,
              'user_id', r.user_id,
              'username', u.name,
              'rating', r.rating,
              'review_text', r.review_text,
              'created_at', r.created_at,
              'updated_at', r.updated_at,
              'profile_image', COALESCE(s.profile_image, u.profile_image)
            ))
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE r.course_id = c.id
          ) as reviews
        FROM all_courses c
        LEFT JOIN categories cat ON c.category_id = cat.id
        LEFT JOIN education_levels el ON c.education_level_id = el.id
        LEFT JOIN users u ON c.author_id = u.id
        LEFT JOIN teachers t ON u.id = t.user_id
        LEFT JOIN students s ON u.id = s.user_id 
        WHERE c.id = $1 AND c.status = 'published';
    `;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Курс не знайдено' });
    }
    const course = result.rows[0];

    let averageRating = 0;
    if (course.reviews) { 
      const ratings = course.reviews.map(review => review.rating);
      if (ratings.length > 0) {
          averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          averageRating = parseFloat(averageRating.toFixed(1));
      }
    }
    
    res.json({
        id: course.id,
        name: course.name,
        description: course.description,
        price: parseFloat(course.price),
        category: course.category_name,
        level: course.education_level,
        image_url: course.image_url,
        modules: course.modules || [],
        reviews: course.reviews || [],
        average_rating: averageRating, 
        author: {
            id: course.author_id,
            name: course.author_name,
            profile_image: course.author_profile_image,
            nickname: course.author_nickname,
            about: course.author_about,
            experience: course.author_experience
        }
      });

    } catch (err) {
        console.error('Помилка отримання курсу:', err);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    }
});

//-тут
// Маршрут для перевірки чи користувач записаний на курс
router.get('/:courseId/enrollment-status', async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.query;

  try {
      const query = `
          SELECT * FROM enrollments 
          WHERE user_id = $1 AND course_id = $2
      `;
      const result = await pool.query(query, [userId, courseId]);
      
      res.json({
          isEnrolled: result.rows.length > 0,
          enrollment: result.rows[0] || null
      });
  } catch (error) {
      console.error('Error checking enrollment status:', error);
      res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

// Маршрут для запису на курс
router.post('/:courseId/enroll', async (req, res) => {
  const { courseId } = req.params;
  const { userId } = req.body;

  if (!userId) {
      return res.status(400).json({ error: 'Необхідно увійти в систему' });
  }

  try {
      // Перевіряємо чи існує курс
      const courseQuery = `
          SELECT * FROM all_courses 
          WHERE id = $1 AND status = 'published'
      `;
      const courseResult = await pool.query(courseQuery, [courseId]);

      if (courseResult.rows.length === 0) {
          return res.status(404).json({ error: 'Курс не знайдено' });
      }

      const course = courseResult.rows[0];

      // Перевіряємо чи користувач вже записаний
      const enrollmentCheckQuery = `
          SELECT * FROM enrollments 
          WHERE user_id = $1 AND course_id = $2
      `;
      const enrollmentCheck = await pool.query(enrollmentCheckQuery, [userId, courseId]);

      if (enrollmentCheck.rows.length > 0) {
          return res.status(400).json({ error: 'Ви вже записані на цей курс' });
      }

      // Якщо курс платний
      if (course.price > 0) {
          return res.status(402).json({
              error: 'Потрібна оплата',
              courseId,
              price: course.price
          });
      }

      // Записуємо користувача на безкоштовний курс
      const enrollQuery = `
          INSERT INTO enrollments (user_id, course_id, enrollment_date, status, progress)
          VALUES ($1, $2, CURRENT_TIMESTAMP, 'active', 0)
          RETURNING id, enrollment_date
      `;
      const enrollResult = await pool.query(enrollQuery, [userId, courseId]);

      res.status(201).json({
          success: true,
          message: 'Ви успішно записались на курс',
          enrollmentId: enrollResult.rows[0].id,
          enrollmentDate: enrollResult.rows[0].enrollment_date
      });

  } catch (error) {
      console.error('Помилка при записі на курс:', error);
      res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

router.get('/enrolled/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log('Received request for enrolled courses. UserId:', userId);
  
  try {
      const query = `
          SELECT DISTINCT
              c.id,
              c.name,
              c.description,
              c.image_url,
              e.progress,
              e.enrollment_date,
              e.status as enrollment_status
          FROM enrollments e
          INNER JOIN all_courses c ON e.course_id = c.id
          WHERE e.user_id = $1 
          AND e.status = 'active'
          AND c.status = 'published'
          ORDER BY e.enrollment_date DESC
      `;
      console.log('Executing query:', query);
      console.log('With userId:', userId);

      const result = await pool.query(query, [userId]);
      console.log('Query result:', result.rows);

      res.json(result.rows);
  } catch (error) {
      console.error('Error loading courses:', error);
      res.status(500).json({ 
          error: 'Internal server error', 
          details: error.message 
      });
  }
});

router.post('/unenroll/:userId', async (req, res) => {
  const { courseId } = req.body;
  const { userId } = req.params;

  // Validate input
  if (!courseId) {
      return res.status(400).json({ 
          error: 'Missing course ID' 
      });
  } 
  
  if (!userId) {
      return res.status(401).json({ 
          error: 'User not authenticated' 
      });
  }

  try {
      // Begin transaction
      await pool.query('BEGIN');

      // Update enrollment status
      const unenrollQuery = `
          UPDATE enrollments 
          SET 
              status = 'archived', 
              last_accessed = CURRENT_TIMESTAMP 
          WHERE 
              user_id = $1 
              AND course_id = $2 
              AND status = 'active'
          RETURNING *
      `;
      
      const result = await pool.query(unenrollQuery, [userId, courseId]);

      // Check if any rows were updated
      if (result.rows.length === 0) {
          await pool.query('ROLLBACK');
          return res.status(404).json({ 
              error: 'No active enrollment found' 
          });
      }

      // Commit transaction
      await pool.query('COMMIT');

      res.status(200).json({ 
          message: 'Successfully unenrolled from the course',
          details: result.rows[0]
      });

  } catch (error) {
      // Rollback transaction
      await pool.query('ROLLBACK');
      
      console.error('Unenroll error:', error);
      res.status(500).json({ 
          error: 'Internal server error', 
          details: error.message 
      });
  }
});

// Маршрут для збереження курсу
router.post('/save', async (req, res) => {
  const { userId, courseId } = req.body;

  try {
      // Перевіряємо чи курс вже збережений
      const checkQuery = `
          SELECT * FROM saved_courses 
          WHERE user_id = $1 AND course_id = $2
      `;
      const checkResult = await pool.query(checkQuery, [userId, courseId]);

      if (checkResult.rows.length > 0) {
          return res.status(400).json({ 
              success: false, 
              message: 'Курс вже збережений' 
          });
      }

      // Перевіряємо чи існує курс
      const courseQuery = `
          SELECT id FROM all_courses WHERE id = $1
      `;
      const courseResult = await pool.query(courseQuery, [courseId]);

      if (courseResult.rows.length === 0) {
          return res.status(404).json({ 
              success: false, 
              message: 'Курс не знайдено' 
          });
      }

      // Зберігаємо курс
      const saveQuery = `
          INSERT INTO saved_courses (user_id, course_id, saved_at)
          VALUES ($1, $2, CURRENT_TIMESTAMP)
      `;
      await pool.query(saveQuery, [userId, courseId]);

      res.json({ 
          success: true, 
          message: 'Курс успішно збережено' 
      });
  } catch (error) {
      console.error('Помилка при збереженні курсу:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Внутрішня помилка сервера' 
      });
  }
});

// Маршрут для видалення курсу зі збережених
router.delete('/unsave', async (req, res) => {
  const { userId, courseId } = req.body;

  try {
      // Видаляємо курс зі збережених
      const deleteQuery = `
          DELETE FROM saved_courses 
          WHERE user_id = $1 AND course_id = $2
      `;
      const result = await pool.query(deleteQuery, [userId, courseId]);

      if (result.rowCount === 0) {
          return res.status(404).json({
              success: false,
              message: 'Збережений курс не знайдено'
          });
      }

      res.json({ 
          success: true, 
          message: 'Курс видалено зі збережених' 
      });
  } catch (error) {
      console.error('Помилка при видаленні курсу зі збережених:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Внутрішня помилка сервера' 
      });
  }
});

// Маршрут для перевірки чи курс збережений
router.get('/is-saved', async (req, res) => {
  const { userId, courseId } = req.query;

  try {
      const query = `
          SELECT * FROM saved_courses 
          WHERE user_id = $1 AND course_id = $2
      `;
      const result = await pool.query(query, [userId, courseId]);

      res.json({ 
          success: true, 
          isSaved: result.rows.length > 0 
      });
  } catch (error) {
      console.error('Помилка при перевірці статусу збереження:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Внутрішня помилка сервера' 
      });
  }
});

// Маршрут для отримання збережених курсів
router.get('/saved/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
      const query = `
          SELECT c.* 
          FROM all_courses c
          JOIN saved_courses sc ON c.id = sc.course_id
          WHERE sc.user_id = $1
          ORDER BY sc.saved_at DESC
      `;
      const result = await pool.query(query, [userId]);

      res.json(result.rows);
  } catch (error) {
      console.error('Помилка при отриманні збережених курсів:', error);
      res.status(500).json({ 
          success: false, 
          message: 'Внутрішня помилка сервера' 
      });
  }
});

router.get('/saved/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
      const query = `
          SELECT 
              c.id,
              c.name,
              c.description,
              c.image_url,
              c.price,
              cat.name as category_name,
              el.name as education_level,
              sc.saved_at
          FROM saved_courses sc
          JOIN all_courses c ON sc.course_id = c.id
          LEFT JOIN categories cat ON c.category_id = cat.id
          LEFT JOIN education_levels el ON c.education_level_id = el.id
          WHERE sc.user_id = $1 AND c.status = 'published'
          ORDER BY sc.saved_at DESC
      `;

      const result = await pool.query(query, [userId]);
      
      const savedCourses = result.rows.map(course => ({
          id: course.id,
          name: course.name || 'Без назви',
          description: course.description,
          image_url: course.image_url,
          price: parseFloat(course.price),
          category: course.category_name,
          level: course.education_level,
          saved_at: course.saved_at
      }));

      res.json(savedCourses);
  } catch (error) {
      console.error('Помилка отримання збережених курсів:', error);
      res.status(500).json({ 
          error: 'Внутрішня помилка сервера', 
          details: error.message 
      });
  }
});
//маршрут для додавання курсу в закладки
router.post('/bookmarks', async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
      return res.status(400).json({ error: 'Невірні дані' });
  }

  try {
    console.log(`📝 Додаємо або змінюємо стан закладки: userId=${userId}, courseId=${courseId}`);

    await pool.query(`
      INSERT INTO bookmarks (user_id, course_id, is_saved) 
      VALUES ($1, $2, TRUE) 
      ON CONFLICT (user_id, course_id) 
      DO UPDATE SET is_saved = NOT bookmarks.is_saved;
    `, [userId, courseId]);

      res.json({ message: "Курс додано у закладки" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Помилка бази даних" });
  }
});
router.delete('/bookmarks', async (req, res) => {
  const { userId, courseId } = req.body;
  try {
      await pool.query(`
          UPDATE bookmarks SET is_saved = FALSE WHERE user_id = $1 AND course_id = $2;
      `, [userId, courseId]);
      res.json({ message: "Course removed from bookmarks" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
  }
});
router.get('/bookmarks/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
      const { rows } = await pool.query(`
           SELECT ac.id, ac.name, ac.image_url, b.is_saved
            FROM bookmarks b
            JOIN all_courses ac ON b.course_id = ac.id
            WHERE b.user_id = $1 AND b.is_saved = TRUE
      `, [userId]);
      res.json(rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
  }
});


module.exports = router;