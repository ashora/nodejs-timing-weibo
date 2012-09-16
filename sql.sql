

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `common_wb`
--

-- --------------------------------------------------------

--
-- 表的结构 `wb_id`
--

CREATE TABLE IF NOT EXISTS `wb_id` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wb_id` varchar(6500) NOT NULL,
  `wb_token` varchar(6500) DEFAULT NULL,
  `wb_secret` varchar(6500) DEFAULT NULL,
  `wb_username` varchar(650) DEFAULT NULL,
  `wb_accesstoken` varchar(650) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `wb_queue`
--

CREATE TABLE IF NOT EXISTS `wb_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `wb_id` varchar(650) NOT NULL,
  `content` varchar(500) DEFAULT NULL,
  `pic` varchar(6500) DEFAULT NULL,
  `send_time` datetime DEFAULT NULL,
  `wb_username` varchar(650) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
