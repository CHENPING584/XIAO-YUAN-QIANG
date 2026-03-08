-- 增加二手闲置和校园资讯分类
INSERT INTO `categories` (`name`, `type`, `sort_order`) VALUES 
('二手闲置', 'trade', 5),
('校园资讯', 'news', 6);

-- 增加价格字段
ALTER TABLE `posts` ADD COLUMN `price` DECIMAL(10,2) DEFAULT NULL COMMENT '价格(二手交易用)';
