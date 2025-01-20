const express = require('express');
const router = express.Router();
const pool = require('./db');
const multer = require('multer');
const storage = require('./course-creation/storage-config');
 
const upload = multer({ storage }).fields([
    { name: 'course_thumbnail', maxCount: 1 },
    { name: 'lecture_files' },
    { name: 'lecture_videos' },
  ]);
  
  router.post('/save-draft', upload, async (req, res) => {
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
    } = req.body;
  
    let parsedCoursePrice = course_price ? parseFloat(course_price) : null;
    let parsedCourseCategory = course_category ? parseInt(course_category, 10) : null;
    let parsedEducationLevel = education_level ? parseInt(education_level, 10) : null;
  
    if (isNaN(parsedCoursePrice)) parsedCoursePrice = null;
    if (isNaN(parsedCourseCategory)) parsedCourseCategory = null;
    if (isNaN(parsedEducationLevel)) parsedEducationLevel = null;
  
    const courseThumbnail =
      req.files && req.files['course_thumbnail'] && req.files['course_thumbnail'][0]
        ? req.files['course_thumbnail'][0].filename
        : null;
  
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
        SELECT id, name, description, price, category_id, image_url, education_level_id, status
        FROM all_courses
        WHERE author_id = $1 AND (name = $2 OR description = $3) AND status != 'published'
      `;
      const courseCheckResult = await pool.query(courseCheckQuery, [author_id, course_title, course_description]);
  
      if (courseCheckResult.rows.length > 0) {
        
        courseToUpdate = courseCheckResult.rows[0];
  
        const updateQuery = `
          UPDATE all_courses
          SET
            name = COALESCE($1, name),
            description = COALESCE($2, description),
            price = COALESCE($3, price),
            category_id = COALESCE($4, category_id),
            image_url = COALESCE($5, image_url),
            education_level_id = COALESCE($6, education_level_id),
            status = 'draft'
          WHERE id = $7;
        `;
        const updateValues = [
          course_title || courseToUpdate.name,
          course_description || courseToUpdate.description,
          parsedCoursePrice || courseToUpdate.price,
          parsedCourseCategory || courseToUpdate.category_id,
          courseThumbnail || courseToUpdate.image_url,
          parsedEducationLevel || courseToUpdate.education_level_id,
          courseToUpdate.id
        ];
  
        await pool.query(updateQuery, updateValues);
        courseId = courseToUpdate.id;   
      } else { 
        if (!courseId) {
          const query = `
            INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
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
          ]);
          courseId = result.rows[0].id;  
        }
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
          await pool.query(`DELETE FROM videos WHERE lecture_id IN (SELECT id FROM lectures WHERE module_id = ANY($1::int[]))`, [modulesToDelete]);
          await pool.query(`DELETE FROM lectures WHERE module_id = ANY($1::int[])`, [modulesToDelete]);
      
          
          await pool.query(`DELETE FROM modules WHERE id = ANY($1::int[])`, [modulesToDelete]);
        }
      
        
        const modulePromises = modulesArray.map(async (module) => {
          const { id, title, order_num, lectures: moduleLectures } = module;
      
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
            await pool.query(
                `UPDATE modules SET title = $1 WHERE id = $2`,
                [title, moduleId]
            );
        } else {
            const moduleResult = await pool.query(
                `INSERT INTO modules (course_id, title, order_num) VALUES ($1, $2, $3) RETURNING id`,
                [courseId, title, order_num]
            );
            moduleId = moduleResult.rows[0].id;
        }
        
      
          
          if (moduleLectures && Array.isArray(moduleLectures)) {
            const lecturePromises = moduleLectures.map(async (lecture, index) => {
              const { id: lectureId, title, description } = lecture;
      
              if (!title) {
                throw new Error('Lecture must have a title.');
              }
      
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
                  


                
                const filesForThisLecture = req.files['lecture_files']?.slice(index, index + 1); 

                if (filesForThisLecture && filesForThisLecture.length > 0) {
                    
                    await pool.query('DELETE FROM lecture_files WHERE lecture_id = $1', [lectureId]);

                    
                    const file = filesForThisLecture[0]; 
                    await pool.query(
                        `INSERT INTO lecture_files (lecture_id, file_name, file_url, file_type)
                         VALUES ($1, $2, $3, $4)`,
                        [
                            lectureId,
                            file.originalname,
                            file.path,
                            file.mimetype,
                        ]
                    );
                }

                
                const videosForThisLecture = req.files['lecture_videos']?.slice(index, index + 1); 

                if (videosForThisLecture && videosForThisLecture.length > 0) {
                    
                    await pool.query('DELETE FROM videos WHERE lecture_id = $1', [lectureId]);

                    
                    const video = videosForThisLecture[0]; 
                    await pool.query(
                        `INSERT INTO videos (lecture_id, file_name, file_path, file_size)
                         VALUES ($1, $2, $3, $4)`,
                        [
                            lectureId,
                            video.originalname,
                            video.path,
                            video.size,
                        ]
                    );
                }
            }
        });
           
      
            await Promise.all(lecturePromises);
          }
        });
      
        await Promise.all(modulePromises);
      }
      
  
    
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
    const {
        course_title,
        course_description,
        course_price,
        course_category,
        education_level,
        author_id,
        modules, 
    } = req.body;

    const courseThumbnail = req.files['course_thumbnail']
        ? req.files['course_thumbnail'][0].filename
        : null;

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
                    status = 'published'
                WHERE id = $7
                RETURNING id;
            `;
            const updateValues = [
                course_title,
                course_description,
                course_price,
                categoryResult.rows[0].id,
                courseThumbnail,
                educationLevelResult.rows[0].id,
                courseId
            ];

            await pool.query(updateQuery, updateValues);
        } else {
            
            const query = `
                INSERT INTO all_courses (name, description, price, category_id, image_url, author_id, education_level_id, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')
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
              await pool.query(`DELETE FROM videos WHERE lecture_id IN (SELECT id FROM lectures WHERE module_id = ANY($1::int[]))`, [modulesToDelete]);
              await pool.query(`DELETE FROM lectures WHERE module_id = ANY($1::int[])`, [modulesToDelete]);
          
              
              await pool.query(`DELETE FROM modules WHERE id = ANY($1::int[])`, [modulesToDelete]);
            }
          
            
            const modulePromises = modulesArray.map(async (module) => {
              const { id, title, order_num, lectures: moduleLectures } = module;
          
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
                await pool.query(
                    `UPDATE modules SET title = $1 WHERE id = $2`,
                    [title, moduleId]
                );
            } else {
                const moduleResult = await pool.query(
                    `INSERT INTO modules (course_id, title, order_num) VALUES ($1, $2, $3) RETURNING id`,
                    [courseId, title, order_num]
                );
                moduleId = moduleResult.rows[0].id;
            }
            
          
              
              if (moduleLectures && Array.isArray(moduleLectures)) {
                const lecturePromises = moduleLectures.map(async (lecture, index) => {
                  const { id: lectureId, title, description } = lecture;
          
                  if (!title) {
                    throw new Error('Lecture must have a title.');
                  }
          
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
                      
    
    
                    
                    const filesForThisLecture = req.files['lecture_files']?.slice(index, index + 1); 
    
                    if (filesForThisLecture && filesForThisLecture.length > 0) {
                        
                        await pool.query('DELETE FROM lecture_files WHERE lecture_id = $1', [lectureId]);
    
                        
                        const file = filesForThisLecture[0]; 
                        await pool.query(
                            `INSERT INTO lecture_files (lecture_id, file_name, file_url, file_type)
                             VALUES ($1, $2, $3, $4)`,
                            [
                                lectureId,
                                file.originalname,
                                file.path,
                                file.mimetype,
                            ]
                        );
                    }
    
                    
                    const videosForThisLecture = req.files['lecture_videos']?.slice(index, index + 1); 
    
                    if (videosForThisLecture && videosForThisLecture.length > 0) {
                        
                        await pool.query('DELETE FROM videos WHERE lecture_id = $1', [lectureId]);
    
                        
                        const video = videosForThisLecture[0]; 
                        await pool.query(
                            `INSERT INTO videos (lecture_id, file_name, file_path, file_size)
                             VALUES ($1, $2, $3, $4)`,
                            [
                                lectureId,
                                video.originalname,
                                video.path,
                                video.size,
                            ]
                        );
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

module.exports = router;