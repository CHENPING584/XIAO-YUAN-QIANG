-- 校园墙数据库完整建表语句
CREATE DATABASE IF NOT EXISTS `campus_wall` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `campus_wall`;

-- 1. 用户表 (Users)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
  `openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信OpenID',
  `nickname` VARCHAR(64) DEFAULT '微信用户' COMMENT '昵称',
  `avatar_url` VARCHAR(255) DEFAULT '' COMMENT '头像链接',
  `role` ENUM('user', 'admin') DEFAULT 'user' COMMENT '角色: user-普通用户, admin-管理员',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 板块分类表 (Categories)
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
  `name` VARCHAR(32) NOT NULL COMMENT '分类名称',
  `type` VARCHAR(32) NOT NULL COMMENT '分类标识: love-表白, lost-失物, help-互助, hole-树洞',
  `sort_order` INT DEFAULT 0 COMMENT '排序权重',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1-启用, 0-禁用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='板块分类表';

-- 初始数据
INSERT INTO `categories` (`name`, `type`, `sort_order`) VALUES 
('表白墙', 'love', 1),
('失物招领', 'lost', 2),
('校园互助', 'help', 3),
('树洞吐槽', 'hole', 4);

-- 3. 投稿内容表 (Posts)
CREATE TABLE `posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '投稿ID',
  `user_id` INT NOT NULL COMMENT '发布者ID',
  `category_id` INT NOT NULL COMMENT '分类ID',
  `content` TEXT NOT NULL COMMENT '内容',
  `images` JSON DEFAULT NULL COMMENT '图片列表(JSON数组)',
  `contact_info` VARCHAR(100) DEFAULT NULL COMMENT '联系方式(失物/互助)',
  `is_anonymous` TINYINT DEFAULT 0 COMMENT '是否匿名: 1-是, 0-否',
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
  `reject_reason` VARCHAR(255) DEFAULT NULL COMMENT '驳回原因',
  `is_resolved` TINYINT DEFAULT 0 COMMENT '是否解决/找回: 1-是, 0-否',
  `views` INT DEFAULT 0 COMMENT '浏览量',
  `likes` INT DEFAULT 0 COMMENT '点赞数',
  `comments_count` INT DEFAULT 0 COMMENT '评论数',
  `is_top` TINYINT DEFAULT 0 COMMENT '是否置顶: 1-是, 0-否',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '发布时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='投稿内容表';

-- 4. 评论表 (Comments)
CREATE TABLE `comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '评论ID',
  `post_id` INT NOT NULL COMMENT '投稿ID',
  `user_id` INT NOT NULL COMMENT '评论者ID',
  `content` VARCHAR(500) NOT NULL COMMENT '评论内容',
  `parent_id` INT DEFAULT NULL COMMENT '父评论ID(回复)',
  `is_anonymous` TINYINT DEFAULT 0 COMMENT '是否匿名',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-隐藏',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评论时间',
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表';

-- 5. 点赞记录表 (Likes)
CREATE TABLE `likes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_post` (`user_id`, `post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞记录表';

-- 6. 收藏记录表 (Collections)
CREATE TABLE `collections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `post_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_post` (`user_id`, `post_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏记录表';

-- 7. 轮播图表 (Slides)
CREATE TABLE `slides` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `image_url` VARCHAR(255) NOT NULL COMMENT '图片地址',
  `link_type` ENUM('post', 'url', 'none') DEFAULT 'none' COMMENT '跳转类型',
  `link_target` VARCHAR(255) DEFAULT NULL COMMENT '跳转目标(post_id或URL)',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1-显示, 0-隐藏',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='轮播图表';

-- 8. 举报记录表 (Reports)
CREATE TABLE `reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL COMMENT '举报人',
  `post_id` INT NOT NULL COMMENT '被举报帖子',
  `reason` VARCHAR(255) NOT NULL COMMENT '举报原因',
  `status` ENUM('pending', 'processed') DEFAULT 'pending' COMMENT '处理状态',
  `result` VARCHAR(255) DEFAULT NULL COMMENT '处理结果',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报记录表';
