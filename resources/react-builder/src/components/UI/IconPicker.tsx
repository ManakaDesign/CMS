import React, { useState } from 'react';
import * as FiIcons from 'react-icons/fi';
import { FiX, FiSearch } from 'react-icons/fi';

interface IconPickerProps {
  selectedIcon?: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

// Popular Feather icons list
const ICON_LIST = [
  'FiActivity', 'FiAirplay', 'FiAlertCircle', 'FiAlertTriangle', 'FiAlignCenter',
  'FiAlignJustify', 'FiAlignLeft', 'FiAlignRight', 'FiAnchor', 'FiAperture',
  'FiArchive', 'FiArrowDown', 'FiArrowDownCircle', 'FiArrowDownLeft', 'FiArrowDownRight',
  'FiArrowLeft', 'FiArrowLeftCircle', 'FiArrowRight', 'FiArrowRightCircle', 'FiArrowUp',
  'FiArrowUpCircle', 'FiArrowUpLeft', 'FiArrowUpRight', 'FiAtSign', 'FiAward',
  'FiBarChart', 'FiBarChart2', 'FiBattery', 'FiBatteryCharging', 'FiBell',
  'FiBellOff', 'FiBluetooth', 'FiBold', 'FiBook', 'FiBookOpen',
  'FiBookmark', 'FiBox', 'FiBriefcase', 'FiCalendar', 'FiCamera',
  'FiCameraOff', 'FiCast', 'FiCheck', 'FiCheckCircle', 'FiCheckSquare',
  'FiChevronDown', 'FiChevronLeft', 'FiChevronRight', 'FiChevronUp', 'FiChevronsDown',
  'FiChevronsLeft', 'FiChevronsRight', 'FiChevronsUp', 'FiChrome', 'FiCircle',
  'FiClipboard', 'FiClock', 'FiCloud', 'FiCloudDrizzle', 'FiCloudLightning',
  'FiCloudOff', 'FiCloudRain', 'FiCloudSnow', 'FiCode', 'FiCodepen',
  'FiCodesandbox', 'FiCoffee', 'FiColumns', 'FiCommand', 'FiCompass',
  'FiCopy', 'FiCornerDownLeft', 'FiCornerDownRight', 'FiCornerLeftDown', 'FiCornerLeftUp',
  'FiCornerRightDown', 'FiCornerRightUp', 'FiCornerUpLeft', 'FiCornerUpRight', 'FiCpu',
  'FiCreditCard', 'FiCrop', 'FiCrosshair', 'FiDatabase', 'FiDelete',
  'FiDisc', 'FiDollarSign', 'FiDownload', 'FiDownloadCloud', 'FiDroplet',
  'FiEdit', 'FiEdit2', 'FiEdit3', 'FiExternalLink', 'FiEye',
  'FiEyeOff', 'FiFacebook', 'FiFastForward', 'FiFeather', 'FiFigma',
  'FiFile', 'FiFileMinus', 'FiFilePlus', 'FiFileText', 'FiFilm',
  'FiFilter', 'FiFlag', 'FiFolder', 'FiFolderMinus', 'FiFolderPlus',
  'FiFramer', 'FiFrown', 'FiGift', 'FiGitBranch', 'FiGitCommit',
  'FiGitMerge', 'FiGitPullRequest', 'FiGithub', 'FiGitlab', 'FiGlobe',
  'FiGrid', 'FiHardDrive', 'FiHash', 'FiHeadphones', 'FiHeart',
  'FiHelpCircle', 'FiHexagon', 'FiHome', 'FiImage', 'FiInbox',
  'FiInfo', 'FiInstagram', 'FiItalic', 'FiKey', 'FiLayers',
  'FiLayout', 'FiLifeBuoy', 'FiLink', 'FiLink2', 'FiLinkedin',
  'FiList', 'FiLoader', 'FiLock', 'FiLogIn', 'FiLogOut',
  'FiMail', 'FiMap', 'FiMapPin', 'FiMaximize', 'FiMaximize2',
  'FiMeh', 'FiMenu', 'FiMessageCircle', 'FiMessageSquare', 'FiMic',
  'FiMicOff', 'FiMinimize', 'FiMinimize2', 'FiMinus', 'FiMinusCircle',
  'FiMinusSquare', 'FiMonitor', 'FiMoon', 'FiMoreHorizontal', 'FiMoreVertical',
  'FiMousePointer', 'FiMove', 'FiMusic', 'FiNavigation', 'FiNavigation2',
  'FiOctagon', 'FiPackage', 'FiPaperclip', 'FiPause', 'FiPauseCircle',
  'FiPenTool', 'FiPercent', 'FiPhone', 'FiPhoneCall', 'FiPhoneForwarded',
  'FiPhoneIncoming', 'FiPhoneMissed', 'FiPhoneOff', 'FiPhoneOutgoing', 'FiPieChart',
  'FiPlay', 'FiPlayCircle', 'FiPlus', 'FiPlusCircle', 'FiPlusSquare',
  'FiPocket', 'FiPower', 'FiPrinter', 'FiRadio', 'FiRefreshCcw',
  'FiRefreshCw', 'FiRepeat', 'FiRewind', 'FiRotateCcw', 'FiRotateCw',
  'FiRss', 'FiSave', 'FiScissors', 'FiSearch', 'FiSend',
  'FiServer', 'FiSettings', 'FiShare', 'FiShare2', 'FiShield',
  'FiShieldOff', 'FiShoppingBag', 'FiShoppingCart', 'FiShuffle', 'FiSidebar',
  'FiSkipBack', 'FiSkipForward', 'FiSlack', 'FiSlash', 'FiSliders',
  'FiSmartphone', 'FiSmile', 'FiSpeaker', 'FiSquare', 'FiStar',
  'FiStopCircle', 'FiSun', 'FiSunrise', 'FiSunset', 'FiTablet',
  'FiTag', 'FiTarget', 'FiTerminal', 'FiThermometer', 'FiThumbsDown',
  'FiThumbsUp', 'FiToggleLeft', 'FiToggleRight', 'FiTool', 'FiTrash',
  'FiTrash2', 'FiTrello', 'FiTrendingDown', 'FiTrendingUp', 'FiTriangle',
  'FiTruck', 'FiTv', 'FiTwitch', 'FiTwitter', 'FiType',
  'FiUmbrella', 'FiUnderline', 'FiUnlock', 'FiUpload', 'FiUploadCloud',
  'FiUser', 'FiUserCheck', 'FiUserMinus', 'FiUserPlus', 'FiUserX',
  'FiUsers', 'FiVideo', 'FiVideoOff', 'FiVoicemail', 'FiVolume',
  'FiVolume1', 'FiVolume2', 'FiVolumeX', 'FiWatch', 'FiWifi',
  'FiWifiOff', 'FiWind', 'FiX', 'FiXCircle', 'FiXOctagon',
  'FiXSquare', 'FiYoutube', 'FiZap', 'FiZapOff', 'FiZoomIn', 'FiZoomOut'
];

export const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect, onClose }) => {
  const [search, setSearch] = useState('');

  const filteredIcons = ICON_LIST.filter(iconName =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-bg border border-dark-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-light-text">Select Icon</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-dark-border">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-muted" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="w-full pl-10 pr-4 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted focus:outline-none focus:border-brand-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-8 gap-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = (FiIcons as any)[iconName];
              if (!IconComponent) return null;

              return (
                <button
                  key={iconName}
                  onClick={() => onSelect(iconName)}
                  className={`p-3 rounded transition-colors flex items-center justify-center ${
                    selectedIcon === iconName
                      ? 'bg-brand-primary text-white'
                      : 'bg-dark-panel text-light-text hover:bg-dark-hover border border-dark-border'
                  }`}
                  title={iconName.replace('Fi', '')}
                >
                  <IconComponent size={20} />
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-light-muted">
              No icons found for "{search}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border flex justify-between">
          <button
            onClick={() => onSelect('')}
            className="px-4 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text hover:bg-dark-hover transition-colors"
          >
            Clear Icon
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-brand-primary text-white rounded text-sm hover:bg-opacity-90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
