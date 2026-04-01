import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  Download,
  MoreHorizontal,
  Heart,
  MessageSquare,
  X,
  Zap,
  Pencil,
  AlignLeft,
  Home,
  Folder,
  BookOpen,
  ShoppingBag,
  MessageCircle,
  BellRing,
  DollarSign,
  BarChart2,
  Megaphone,
  LayoutGrid,
  Globe,
  ChevronsRight,
  ChevronsLeft,
  PanelLeftClose,
  TrendingUp,
  ExternalLink,
  Calendar,
  PlusCircle,
  FileText,
  Users,
  Shield,
  Gamepad2,
  type LucideIcon,
} from 'lucide-react';
import styles from './HomeDashboard.module.css';
import avatarImg from '../../assets/avatar.png';
import riotfallImg from '../../assets/riotfall.png';
import heroImg from '../../assets/home_hero.png';
import tiltSvg from '../../assets/tilt.svg';

// ─── Static data ───────────────────────────────────────────────────────────────

interface ExperienceEntry {
  id: string;
  title: string;
  thumbnail: string;
  visibility: 'Public' | 'Private';
  concurrentUsers: string;
  dau: string;
  d1Retention: string;
  dailyRevenue: string;
  avgPlaytime: string;
  overviewLink: string;
}

const EXPERIENCES_DATA: ExperienceEntry[] = [
  // Index 0 — injected custom entry
  { id: 'monkey-game',  title: 'The Great Escape Monkey Game', thumbnail: 'https://placehold.co/150x150/1a1b20/5a6280?text=🐒', visibility: 'Public',  concurrentUsers: '1.2k', dau: '5.4k',  d1Retention: '22.5%', dailyRevenue: '12.4k', avgPlaytime: '18.3m', overviewLink: '/experience/overview' },
  // Parsed from production HTML
  { id: '9930902439',   title: 'tomato-game',                  thumbnail: 'https://tr.rbxcdn.com/180DAY-7a391f72b43f99f792928c76581e1fa5/150/150/Place/Webp/noFilter',  visibility: 'Private', concurrentUsers: '34',   dau: '120',   d1Retention: '14.2%', dailyRevenue: '450',   avgPlaytime: '12.5m', overviewLink: '/experience/overview' },
  { id: '9927282255',   title: 'minimum-viable-hockey',        thumbnail: 'https://tr.rbxcdn.com/180DAY-21c6dbfd88f7521c34fbdf851613b669/150/150/Place/Webp/noFilter', visibility: 'Private', concurrentUsers: '8',    dau: '22',    d1Retention: '8.1%',  dailyRevenue: '50',    avgPlaytime: '6.2m',  overviewLink: '/experience/overview' },
  { id: '9912633505',   title: 'basic-air-hockey',             thumbnail: 'https://tr.rbxcdn.com/180DAY-6ea568ea7c8bcfeeb335fe05b5d0dcb6/150/150/Place/Webp/noFilter',  visibility: 'Private', concurrentUsers: '450',  dau: '1.1k',  d1Retention: '19.7%', dailyRevenue: '3.2k',  avgPlaytime: '24.1m', overviewLink: '/experience/overview' },
  { id: '9911973945',   title: 'Untitled Experience',          thumbnail: 'https://tr.rbxcdn.com/180DAY-80e60f49129ea46ccb6fedf2867d7386/150/150/Place/Webp/noFilter', visibility: 'Private', concurrentUsers: '2',    dau: '9',     d1Retention: '5.0%',  dailyRevenue: '0',     avgPlaytime: '3.1m',  overviewLink: '/experience/overview' },
  { id: '9911041067',   title: 'minimal hockey',               thumbnail: 'https://tr.rbxcdn.com/180DAY-5bb00eab031eeb2437ea45740df89a67/150/150/Place/Webp/noFilter',  visibility: 'Private', concurrentUsers: '71',   dau: '280',   d1Retention: '11.4%', dailyRevenue: '820',   avgPlaytime: '9.8m',  overviewLink: '/experience/overview' },
  { id: '9903517998',   title: 'demo-air-hockey',              thumbnail: 'https://tr.rbxcdn.com/180DAY-14d2ce973aa2b88aeeabf719e5ac514d/150/150/Place/Webp/noFilter', visibility: 'Private', concurrentUsers: '16',   dau: '58',    d1Retention: '7.3%',  dailyRevenue: '130',   avgPlaytime: '8.2m',  overviewLink: '/experience/overview' },
  { id: '9896282570',   title: 'mmo test experience vibes',    thumbnail: 'https://tr.rbxcdn.com/180DAY-a11e5680bdfea4fa86d29ea86156c10a/150/150/Place/Webp/noFilter', visibility: 'Private', concurrentUsers: '203',  dau: '740',   d1Retention: '17.6%', dailyRevenue: '2.1k',  avgPlaytime: '16.0m', overviewLink: '/experience/overview' },
  { id: '9894251789',   title: 'npc plugin v2 test',           thumbnail: 'https://tr.rbxcdn.com/180DAY-e65904606f7ebb4b2d955c186e5e8f33/150/150/Place/Webp/noFilter',  visibility: 'Private', concurrentUsers: '5',    dau: '14',    d1Retention: '6.2%',  dailyRevenue: '20',    avgPlaytime: '4.7m',  overviewLink: '/experience/overview' },
  { id: '9894240786',   title: 'ncp obby test example',        thumbnail: 'https://tr.rbxcdn.com/180DAY-0a43898b838370fd9bf088a2861fa07d/150/150/Place/Webp/noFilter',  visibility: 'Private', concurrentUsers: '89',   dau: '310',   d1Retention: '13.8%', dailyRevenue: '970',   avgPlaytime: '11.2m', overviewLink: '/experience/overview' },
  { id: '9852512297',   title: 'Roguelike engine npc demo',    thumbnail: 'https://tr.rbxcdn.com/180DAY-c4b1d27d2e80e6e4ab0c4dfa618f7da6/150/150/Place/Webp/noFilter',  visibility: 'Private', concurrentUsers: '612',  dau: '2.3k',  d1Retention: '20.1%', dailyRevenue: '7.8k',  avgPlaytime: '21.4m', overviewLink: '/experience/overview' },
  { id: '9831779559',   title: 'racing template',              thumbnail: 'https://tr.rbxcdn.com/180DAY-283268c629542b0694ac26bf3d548c3a/150/150/Place/Webp/noFilter',   visibility: 'Private', concurrentUsers: '27',   dau: '95',    d1Retention: '9.5%',  dailyRevenue: '270',   avgPlaytime: '7.6m',  overviewLink: '/experience/overview' },
  { id: '9628610664',   title: 'hot lava bonanza',             thumbnail: 'https://tr.rbxcdn.com/180DAY-c6dd83eadad007b0ed8c53a45e47fe69/150/150/Place/Webp/noFilter',   visibility: 'Private', concurrentUsers: '1',    dau: '4',     d1Retention: '3.3%',  dailyRevenue: '0',     avgPlaytime: '2.0m',  overviewLink: '/experience/overview' },
];

interface LearnItem {
  id: string;
  type: 'video' | 'doc';
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  duration?: string;
  author?: string;
  authorAvatar?: string;
}

const AVATAR = 'https://prod.docsiteassets.roblox.com/assets/feeds/robloxYoutubeAvatar.webp';
const LEARN_DATA: LearnItem[] = [
  { id: 'client-server',      type: 'video', url: 'https://www.youtube.com/watch?v=ougjxNrDvQo',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/client_server.webp',      title: 'Client-server architecture and twin stick shooters',      description: "If you've used other engines, get comfortable developing on Roblox.",                   duration: '8:43',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'running-business',   type: 'video', url: 'https://www.youtube.com/watch?v=DxkvjLf4ZK8',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/ricco.webp',                title: 'Running a business on Roblox (feat. RiccoMiller)',         description: 'Hear all about running a studio from the creator of Dead Rails.',                        duration: '18:57', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'recommendation',     type: 'doc',   url: 'https://create.roblox.com/docs/production/recommendation',                                   thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/recommendation.webp',    title: 'Recommendation systems',                                  description: 'Use the recommendation service to surface personalized content.' },
  { id: 'head-validation',    type: 'video', url: 'https://www.youtube.com/watch?v=OwhkWzSBnf0',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/validation.webp',           title: 'How head validation works',                               description: 'Learn how Roblox verifies avatar UGC heads and other helpful tips.',                    duration: '5:42',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'ad-campaign',        type: 'video', url: 'https://www.youtube.com/watch?v=5HcH-9E7USc',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/ads_manager.webp',          title: 'Run an ad campaign',                                      description: 'Choose audiences, control spend, and measure impact with Ads Manager.',                  duration: '3:24',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'boots',              type: 'video', url: 'https://www.youtube.com/watch?v=xy3xQB7V5Vk',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/boots.webp',                title: 'How to create boots with auto setup',                     description: "Create stylish boots using Roblox's autosetup tool!",                                   duration: '15:11', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'age-chat',           type: 'doc',   url: 'https://devforum.roblox.com/t/optimizing-your-experience-for-age-based-chat-a-guide-to-custom-matchmaking/4164379', thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/age_chat.webp',             title: 'Optimize for age-based chat',                             description: 'Keep your experience social with text chat signal and custom matchmaking.' },
  { id: 'lod',                type: 'video', url: 'https://www.youtube.com/watch?v=Wwj8EkMWFhI',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/lod.webp',                  title: 'Manage level of detail',                                  description: "Roblox's LOD settings can help your experience look better and run better.",            duration: '6:02',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'fps-design',         type: 'video', url: 'https://www.youtube.com/watch?v=fGaiAvh7Q-4',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/fps_design.webp',            title: 'FPS design',                                              description: 'Start your next first-person shooter with a three-lane design.',                        duration: '11:52', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'video-previews',     type: 'video', url: 'https://www.youtube.com/watch?v=ag569uHM96E',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/video_previews.webp',        title: 'Video previews on Roblox',                                description: 'Add gameplay preview videos to your experience pages!',                                 duration: '3:01',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'making-a-bag',       type: 'video', url: 'https://www.youtube.com/watch?v=3DwmBNtf7rY',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/making-a-bag.webp',          title: 'How to make a bag on Roblox',                             description: 'Create a fashionable bag and charm from scratch!',                                      duration: '15:57', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'asset-repo',         type: 'video', url: 'https://www.youtube.com/watch?v=T8XuL1CPEQI',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/asset_repo.webp',            title: 'Build an asset repo',                                     description: 'Learn how to put together an asset repo for an FPS with Hal_Apenyo.',                  duration: '4:07',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'camera-manip',       type: 'video', url: 'https://www.youtube.com/watch?v=Iht0ddcLWFU',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/camera_manip.webp',          title: 'Camera manipulation',                                     description: 'Learn about cutscenes, camera shake, and even custom camera systems.',                  duration: '15:24', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'make-hair',          type: 'video', url: 'https://www.youtube.com/watch?v=TTfPdC6IkNY',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/make_hair.webp',              title: 'How to make hair',                                        description: 'Catch up with voguebrunette and create a hairstyle. With a headband!',                  duration: '10:46', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'client-mem',         type: 'video', url: 'https://www.youtube.com/watch?v=OCUZKJJR-TE',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/client_mem.webp',            title: 'Minimize client memory usage',                            description: 'Learn best practices around client memory usage on low-end devices.',                   duration: '10:49', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'code-org',           type: 'video', url: 'https://www.youtube.com/watch?v=jLNgutvbALY',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/code_org.webp',              title: 'Code organization',                                       description: 'Learn where to put code and how to organize by type or by feature.',                    duration: '6:19',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'studio-comments',    type: 'video', url: 'https://www.youtube.com/watch?v=OMoqgASUcwo',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/studio_comments.webp',       title: 'Studio comments',                                         description: 'Collaborate with your team or just jot down your thoughts with comments.',              duration: '2:07',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'single-multi',       type: 'video', url: 'https://www.youtube.com/watch?v=Yxh8IsUIsZk',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/single_multi_script.webp',   title: 'Single vs. multi-script architecture',                    description: 'What are the pros and cons of the two approaches?',                                     duration: '10:49', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'autosetup',          type: 'video', url: 'https://www.youtube.com/watch?v=Hp9pr2FpZa8',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/autosetup.webp',             title: 'How to turn ANY model into an avatar',                    description: 'Learn how to convert a model into an avatar in less than 5 minutes.',                   duration: '7:57',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'version-control',    type: 'video', url: 'https://www.youtube.com/watch?v=sU9nTX0JFyY',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/version_control.webp',       title: 'Version control on Roblox',                               description: 'Learn all about place versions, packages, and script history.',                         duration: '4:48',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'rush-ugc',           type: 'video', url: 'https://www.youtube.com/watch?v=KSez8Ecq50A',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/rush_ugc.webp',              title: 'UGC as a business (feat. Rush)',                           description: 'DucksAreYellow and Rush Bogin talk best practices and gotchas for UGC.',                duration: '22:48', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'polish-env',         type: 'video', url: 'https://www.youtube.com/watch?v=4kasDMSDvcQ',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/polish_environment.webp',    title: 'Polish your environment',                                 description: 'Finalize your assets, spruce up your terrain, add effects, and oh my.',                 duration: '14:54', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'memory-leaks',       type: 'video', url: 'https://www.youtube.com/watch?v=x1JgsC8c8VQ',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/memory_leaks.webp',          title: 'Find and fix memory leaks',                               description: 'Learn how to use the LuauHeap tool to keep an eye on memory usage.',                    duration: '8:00',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'smooth-damp',        type: 'video', url: 'https://www.youtube.com/watch?v=RYzj4TjiMyE',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/smooth_damp.webp',           title: 'Using the SmoothDamp method',                             description: 'Keep your transitions smooth even when the target value changes.',                      duration: '7:50',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'lighting-terrain',   type: 'video', url: 'https://www.youtube.com/watch?v=XgkmKxyRuWE',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/lighting_terrain.webp',      title: 'Lighting and terrain',                                    description: 'Take a deep dive into lighting your environment and adding terrain.',                   duration: '15:03', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'rewarded-ads',       type: 'video', url: 'https://www.youtube.com/watch?v=Jpj0VnA-jmI',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/rewarded_ads.webp',          title: 'Rewarded video ads',                                      description: 'Learn how to implement rewarded video ads in your experiences.',                        duration: '2:42',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'remote-events',      type: 'video', url: 'https://www.youtube.com/watch?v=n5uOVlCIUjI',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/stephen_remotes.webp',       title: 'Work with remote events',                                 description: 'When should you consider using an UnreliableRemoteEvent?',                              duration: '9:15',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'bans-dashboard',     type: 'doc',   url: 'https://create.roblox.com/docs/production/bans',                                             thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/bans_dash.webp',           title: 'Bans dashboard',                                          description: 'Manage your permanent and temporary bans from Creator Hub.' },
  { id: 'luau-time',          type: 'video', url: 'https://www.youtube.com/watch?v=VE56HDVNibI',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/luau_time.webp',             title: "It's about time()",                                       description: 'Learn about all the best methods for telling time in Roblox experiences.',               duration: '10:08', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'grayboxing',         type: 'video', url: 'https://www.youtube.com/watch?v=T--CNfkfBBQ',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/graybox.webp',               title: 'Grayboxing environments',                                 description: 'Learn best practices for blocking out your environments.',                               duration: '12:19', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'debugger',           type: 'video', url: 'https://www.youtube.com/watch?v=yOmPc2g8tbY',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/debugger.webp',              title: 'Using the Studio debugger',                               description: 'An in-depth look at how to debug your code in Roblox Studio.',                          duration: '11:08', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'luau-oop',           type: 'video', url: 'https://www.youtube.com/watch?v=fByFKZarNiI',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/luau_oop.webp',              title: 'Luau and OOP',                                            description: 'Object-oriented programming in Luau. When does it make sense?',                         duration: '11:24', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'ui-styles',          type: 'video', url: 'https://www.youtube.com/watch?v=_k1ea0OIKaU',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/ui_style.webp',              title: 'Simplify development with UI styles',                     description: 'Use the new Style Manager to create, manage, and apply UI styles.',                    duration: '8:34',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'modulescripts',      type: 'video', url: 'https://www.youtube.com/watch?v=foKFpXZYXPk',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/modulescripts_sleit.webp',   title: 'ModuleScript basics',                                     description: 'Learn how module scripts work and when to use them.',                                   duration: '5:41',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'datastores-mmo',     type: 'video', url: 'https://www.youtube.com/watch?v=PeIZN7tPutg',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/datastores_mmo.webp',        title: 'Build an MMO with data stores',                           description: 'Use data stores to save player progress and handle player position.',                   duration: '6:23',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'shoes',              type: 'video', url: 'https://www.youtube.com/watch?v=NHgYM78afqc',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/shoes.webp',                title: 'How to make shoes for Roblox',                            description: 'Make and sell your first pair of shoes on Roblox.',                                     duration: '14:10', author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'perf-basics',        type: 'video', url: 'https://www.youtube.com/watch?v=VDO_amtWfDw',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/performance_basics.webp',    title: 'Performance optimization basics',                         description: 'Learn how to deal with the most common performance problems.',                          duration: '9:58',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'ugc-insights',       type: 'video', url: 'https://www.youtube.com/watch?v=Zb1BJow0NV4',  thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/rp_interview.webp',          title: 'UGC insights ft. Reverse_Polarity and Madison_Hatter2',  description: 'Learn how to sell and promote avatar items with insights from the experts.',            duration: '9:37',  author: 'RobloxLearn', authorAvatar: AVATAR },
  { id: 'data-model',         type: 'doc',   url: 'https://create.roblox.com/docs/projects/data-model',                                         thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/data_model.webp',          title: 'Data Model',                                              description: 'All objects that make up a 3D world, such as parts and lighting' },
  { id: 'collaboration',      type: 'doc',   url: 'https://create.roblox.com/docs/projects/collaboration',                                      thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/collaboration.webp',       title: 'Collaboration',                                           description: "Use Studio's collaboration tools to work with your team at the same time" },
  { id: 'assets',             type: 'doc',   url: 'https://create.roblox.com/docs/projects/assets',                                             thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/assets.webp',             title: 'Assets',                                                  description: 'Learn how to upload or use assets from Store in your creations' },
  { id: 'workspace',          type: 'doc',   url: 'https://create.roblox.com/docs/workspace',                                                   thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/workspace.webp',          title: 'Workspace',                                               description: 'Workspace holds objects that you want the engine to render in your project' },
  { id: 'roblox-studio',      type: 'doc',   url: 'https://create.roblox.com/docs/studio',                                                      thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/roblox_studio.webp',     title: 'Roblox Studio',                                           description: 'Build your experiences in Studio, our all-in-one IDE, and deploy to a wide variety of devices.' },
  { id: 'scripting',          type: 'doc',   url: 'https://create.roblox.com/docs/scripting',                                                   thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/scripting.webp',         title: 'Scripting',                                               description: 'Scripting lets you add immersive interactions for your users' },
  { id: 'players',            type: 'doc',   url: 'https://create.roblox.com/docs/players',                                                     thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/players.webp',           title: 'Players',                                                 description: 'Learn about what happens when a user joins an experience' },
  { id: 'lighting-effects',   type: 'doc',   url: 'https://create.roblox.com/docs/environment',                                                 thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/lighting_effects.webp',  title: 'Lighting & Effects',                                      description: 'The Lighting and SoundService let you control environmental effects' },
  { id: 'avatars',            type: 'doc',   url: 'https://create.roblox.com/docs/avatar',                                                      thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/avatars.webp',           title: 'Avatars',                                                 description: 'The avatar represents every Roblox user as a customizable character' },
  { id: 'layered-clothing',   type: 'doc',   url: 'https://create.roblox.com/docs/art/accessories/layered-clothing',                            thumbnail: 'https://prod.docsiteassets.roblox.com/assets/feeds/layered_clothing.webp', title: 'Layered Clothing',                                        description: 'Create clothing that stretchs and fit over any avatar body' },
];

interface ExploreItem { id: string; icon: LucideIcon; title: string; description: string; url: string; }
const EXPLORE_DATA: ExploreItem[] = [
  {
    id: 'community-tutorials', icon: FileText,
    title: 'Read community tutorials',
    description: 'Find tutorials written by the Creator community',
    url: 'https://devforum.roblox.com/c/resources/community-tutorials/46/l/top',
  },
  {
    id: 'other-creators', icon: Users,
    title: 'Learn from other Creators',
    description: 'Participate in community events held by other Creators',
    url: 'https://events.roblox.com',
  },
  {
    id: 'popular-users', icon: TrendingUp,
    title: "Understand what's popular with users",
    description: 'Look at the top Experiences out to get inspiration',
    url: 'https://www.roblox.com/discover#/',
  },
  {
    id: 'future-roblox', icon: Zap,
    title: 'Learn about the future of Roblox',
    description: 'Get a preview of new features and capabilities coming soon to Roblox',
    url: 'https://create.roblox.com/roadmap',
  },
  {
    id: 'roblox-staff', icon: Shield,
    title: 'Learn from the Roblox staff',
    description: 'Gain knowledge and expertise directly from Roblox',
    url: 'https://devforum.roblox.com/c/resources/roblox-staff/278',
  },
  {
    id: 'community-content', icon: PlusCircle,
    title: 'Add community content to your Experience',
    description: "Check out what's trending on the Creator Store",
    url: 'https://create.roblox.com/store/models/trending?includeOnlyVerifiedCreators=true',
  },
  {
    id: 'check-creations', icon: LayoutGrid,
    title: 'Check out the creations of other Creators',
    description: 'See this thread of cool creations being built by the community',
    url: 'http://devforum.roblox.com/waywoc',
  },
  {
    id: 'avatar-item', icon: ShoppingBag,
    title: 'Create an Avatar Item',
    description: 'Create Avatar items and publish it to Marketplace',
    url: 'https://create.roblox.com/dashboard/creations?activeTab=TShirt',
  },
];

interface CommunityVideo { id: string; name: string; desc: string; thumb: string; youtubeId: string; }
const COMMUNITY_VIDEOS: CommunityVideo[] = [
  {
    id: 'cv1', name: 'Riotfall',
    desc: 'How the creators of Riotfall are building competitive gameplay on Roblox',
    thumb: riotfallImg,
    youtubeId: 'S-Rx2fGfgB8',
  },
  {
    id: 'cv2', name: 'The Survival Game',
    desc: 'The Clemens are the family-owned studio behind hits like The Survival Game',
    thumb: 'https://www.figma.com/api/mcp/asset/aa25d672-70ba-4bc7-9b50-862e5f186905',
    youtubeId: 'VVkRx-nbOro',
  },
  {
    id: 'cv3', name: 'JailBreak',
    desc: 'BaddCC shares their experience being one of the creators behind JailBreak',
    thumb: 'https://www.figma.com/api/mcp/asset/63933691-0acb-49e9-a13b-9825a8eaa773',
    youtubeId: 't34-HEoZG1k',
  },
  {
    id: 'cv4', name: '@Jazzyx3',
    desc: 'Meet the artist behind some of the most popular avatar items on Roblox',
    thumb: 'https://www.figma.com/api/mcp/asset/dc37f1e8-5efb-47ba-b12a-41c713937844',
    youtubeId: 'jZ_x0OTO5Bw',
  },
];

interface UpdateEntry {
  id: string;
  title: string;
  likes: string;
  comments: string;
  tags: string[];
  thumb: string | null;
}

const UPDATES: UpdateEntry[] = [
  {
    id: 'u1',
    title: 'Custom formula for terrain generation',
    likes: '82.5k', comments: '47',
    tags: [],
    thumb: 'https://www.figma.com/api/mcp/asset/a6f079f8-4d1d-469f-bd91-01823e0ebb01',
  },
  {
    id: 'u2',
    title: 'Creator Roadmap: 2025 End of Year Recap',
    likes: '74.9k', comments: '58',
    tags: ['#studio', '#monetization'],
    thumb: null,
  },
  {
    id: 'u3',
    title: 'Making Avatar Rendering More Performant',
    likes: '91.3k', comments: '36',
    tags: [],
    thumb: 'https://www.figma.com/api/mcp/asset/1a6ab5af-25d8-4be5-8804-cc9a5c022152',
  },
  {
    id: 'u4',
    title: 'Logitech Device Issues with Roblox Studio',
    likes: '88.6k', comments: '54',
    tags: ['#studio', '#monetization'],
    thumb: null,
  },
  {
    id: 'u5',
    title: 'Apply to attend RDC 2026',
    likes: '72.4k', comments: '11',
    tags: [],
    thumb: null,
  },
  {
    id: 'u6',
    title: 'Introducing new tools to manage your game community',
    likes: '97.8k', comments: '22',
    tags: ['#studio', '#monetization'],
    thumb: 'https://www.figma.com/api/mcp/asset/03af7d5a-f2fb-4c48-9531-5a61a088463e',
  },
];

interface NavEntry {
  icon: LucideIcon;
  label: string;
  path?: string;
  active?: boolean;
  badge?: string; // e.g. 'New'
}

const TOP_NAV: NavEntry[] = [
  { icon: Home,          label: 'Home',      path: '/home', active: true },
  { icon: Folder,        label: 'Creations', path: '/creations' },
  { icon: BookOpen,      label: 'Learn' },
  { icon: ShoppingBag,   label: 'Store' },
  { icon: MessageCircle, label: 'Forum' },
  { icon: BellRing,      label: 'Updates', badge: 'New' },
];

const MID_NAV: NavEntry[] = [
  { icon: DollarSign, label: 'Finances' },
  { icon: BarChart2,  label: 'Analytics' },
  { icon: Megaphone,  label: 'Ads' },
];

const TOOLS_NAV: NavEntry[] = [
  { icon: LayoutGrid, label: 'All tools' },
];

const FOOTER_NAV: NavEntry[] = [
  { icon: Globe,   label: 'Roblox.com' },
  { icon: Pencil,  label: 'Studio' },
];

// ─── ExploreCard ────────────────────────────────────────────────────────────────

function ExploreCard({ icon: Icon, title, description, url }: ExploreItem) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.exploreCard}
    >
      <div className={styles.exploreCardIcon}>
        <Icon size={18} />
      </div>
      <h3 className={styles.exploreCardTitle}>{title}</h3>
      <p className={styles.exploreCardDesc}>{description}</p>
    </a>
  );
}

// ─── LearnCard ──────────────────────────────────────────────────────────────────

function LearnCard({ type, url, thumbnail, title, description, duration, author, authorAvatar }: LearnItem) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.learnCard}>
      {/* Thumbnail */}
      <div className={styles.learnThumbWrap}>
        <img src={thumbnail} alt={title} className={styles.learnThumb} />
        {type === 'video' && duration && (
          <span className={styles.learnDuration}>{duration}</span>
        )}
        {type === 'video' && (
          <div className={styles.learnPlayIcon} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="rgba(0,0,0,0.55)"/>
              <path d="M11 9.5L19 14L11 18.5V9.5Z" fill="white"/>
            </svg>
          </div>
        )}
        {type === 'doc' && (
          <div className={styles.learnDocBadge} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Docs
          </div>
        )}
      </div>

      {/* Text body */}
      <div className={styles.learnCardBody}>
        <h3 className={styles.learnTitle}>{title}</h3>
        <p className={styles.learnDesc}>{description}</p>

        {type === 'video' && author && (
          <div className={styles.learnAuthorRow}>
            {authorAvatar && (
              <img src={authorAvatar} alt={author} className={styles.learnAuthorAvatar} />
            )}
            <span className={styles.learnAuthorName}>{author}</span>
          </div>
        )}
      </div>
    </a>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(true);
  const [isAllToolsOpen, setIsAllToolsOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [activeVideo, setActiveVideo] = useState<CommunityVideo>(COMMUNITY_VIDEOS[2]); // JailBreak default

  // ── Experiences carousel scroll ───────────────────────────────────────
  const expScrollRef = useRef<HTMLDivElement>(null);
  function scrollExp(dir: 'left' | 'right') {
    expScrollRef.current?.scrollBy({ left: dir === 'right' ? 266 : -266, behavior: 'smooth' });
  }

  // ── Learn carousel scroll ──────────────────────────────────────────────
  const learnScrollRef = useRef<HTMLDivElement>(null);
  function scrollLearn(dir: 'left' | 'right') {
    learnScrollRef.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  }

  // ── Explore carousel scroll ────────────────────────────────────────────
  const exploreScrollRef = useRef<HTMLDivElement>(null);
  function scrollExplore(dir: 'left' | 'right') {
    exploreScrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  }

  // ── Banner visibility ─────────────────────────────────────────────────
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  // ── Feature flag override system ───────────────────────────────────────
  const [flagMenuOpen, setFlagMenuOpen] = useState(false);
  const [useV1, setUseV1] = useState(true);    // Elastic push/pull (DEFAULT)
  const [useV2, setUseV2] = useState(false);   // Overlay layer
  const [groupExpanded, setGroupExpanded] = useState(true);
  const [flagPos, setFlagPos] = useState({ x: 80, y: 120 });
  const flagDragRef = useRef<{
    startX: number; startY: number; origX: number; origY: number;
  } | null>(null);

  // Press [ to toggle the feature flag menu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey) setFlagMenuOpen(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function onFlagDragStart(e: React.MouseEvent) {
    const { clientX, clientY } = e;
    flagDragRef.current = {
      startX: clientX, startY: clientY, origX: flagPos.x, origY: flagPos.y,
    };
    const onMove = (ev: MouseEvent) => {
      if (!flagDragRef.current) return;
      setFlagPos({
        x: flagDragRef.current.origX + ev.clientX - flagDragRef.current.startX,
        y: flagDragRef.current.origY + ev.clientY - flagDragRef.current.startY,
      });
    };
    const onUp = () => {
      flagDragRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // Mutually exclusive activation helpers
  function activateV1() { setUseV1(true);  setUseV2(false); }
  function activateV2() { setUseV2(true);  setUseV1(false); }
  function resetFlags()  { setUseV1(true);  setUseV2(false); }

  return (
    <>
    <div
      className={styles.shell}
    >

      {/* ── Viewport ─────────────────────────────────────────────────── */}
      <div className={styles.viewport}>

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className={styles.sidebar}>

          {/* ─── Logo row: Roblox mark + CREATOR wordmark ─────────── */}
          <div className={styles.sidebarLogoRow}>
            <img src={tiltSvg} alt="Roblox" className={styles.sidebarLogoMark} />
            <span className={styles.sidebarLogoText}>CREATOR</span>
          </div>

          {/* ─── User context selector ──────────────────────────── */}
          <button className={styles.navContextSelector}>
            <img
              src={avatarImg}
              alt="kal101246"
              className={styles.navContextAvatarImg}
            />
            <span className={styles.navContextName}>kal101246</span>
            <ChevronDown size={12} className={styles.navContextChevron} />
          </button>

          {/* ─── Scrollable nav body ───────────────────────────────── */}
          <div className={styles.navTree}>

            {/* Top nav group */}
            <nav className={styles.navBody}>
              {TOP_NAV.map(({ icon: Icon, label, path, active, badge }) => (
                <button
                  key={label}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  onClick={() => path && navigate(path)}
                >
                  <Icon size={16} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                  {badge && <span className={styles.navItemBadge}>{badge}</span>}
                </button>
              ))}
            </nav>

            <div className={styles.navDivider} />

            {/* Mid nav group: Finances, Analytics, Ads */}
            <nav className={styles.navBody}>
              {MID_NAV.map(({ icon: Icon, label }) => (
                <button key={label} className={styles.navItem}>
                  <Icon size={16} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                </button>
              ))}
            </nav>

            <div className={styles.navDivider} />

            {/* Tools group: All tools */}
            <nav className={styles.navBody}>
              {TOOLS_NAV.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  className={`${styles.navItem} ${isAllToolsOpen ? styles.navItemActive : ''}`}
                  onClick={() => setIsAllToolsOpen(v => !v)}
                >
                  <Icon size={16} className={styles.navItemIcon} />
                  <span className={styles.navItemLabel}>{label}</span>
                </button>
              ))}
            </nav>

          </div>{/* end navTree */}

          {/* ─── Pinned footer ─────────────────────────────────────── */}
          <div className={styles.sidebarFooter}>
            {FOOTER_NAV.map(({ icon: Icon, label }) => (
              <button key={label} className={styles.navItem}>
                <Icon size={16} className={styles.navItemIcon} />
                <span className={styles.navItemLabel}>{label}</span>
              </button>
            ))}
            {/* Collapse sidebar */}
            <button className={styles.sidebarCollapseBtn} aria-label="Collapse sidebar">
              <PanelLeftClose size={16} />
            </button>
          </div>

        </aside>

        {/* ── Primary Pane ──────────────────────────────────────────── */}
        <div className={styles.primaryPane}>

          {/* Header bar */}
          <div className={styles.headerBar}>
            <div className={styles.headerLeading}>
              <button className={styles.headerMenuBtn} aria-label="Toggle sidebar">
                <AlignLeft size={18} />
              </button>
              <nav className={styles.breadcrumb}>
                <span className={`${styles.breadcrumbItem} ${styles.breadcrumbActive}`}>
                  Home
                </span>
              </nav>
            </div>
            <div className={styles.headerTrailing}>
              <button className={styles.headerIconBtn}><Search size={18} /></button>
              <button className={styles.headerIconBtn}>
                <Bell size={18} />
                <span className={styles.headerBadge}>9</span>
              </button>
              <img src={avatarImg} alt="Avatar" className={styles.avatar} />
            </div>
          </div>

          {/* Scrollable body */}
          <div className={styles.contentOuter}>
            <div className={styles.contentLayout}>

              {/* ── Main column ──────────────────────────────────── */}
              <div className={styles.mainCol}>

                {/* System messages alert — dismissible */}
                <div className={`${styles.alertBarWrap} ${!isBannerVisible ? styles.alertBarWrapHidden : ''}`}>
                  <div className={styles.alertBar}>
                    <TriangleAlert size={14} className={styles.alertIcon} />
                    <span className={styles.alertText}>
                      <strong>System messages:</strong> Roblox Studio update 661 is now available.{' '}
                      <a href="#" className={styles.alertLink}>View release notes</a>
                    </span>
                    <button
                      className={styles.alertClose}
                      aria-label="Dismiss"
                      onClick={() => setIsBannerVisible(false)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Hero banner — new users only */}
                {isNewUser && <div className={styles.heroBanner}>
                  <img src={heroImg} alt="" className={styles.heroImg} />
                  <div className={styles.heroGradient} />
                  <div className={styles.heroContent}>
                    <div className={styles.heroTextBlock}>
                      <h1 className={styles.heroTitle}>
                        Create your first experience in Studio
                      </h1>
                      <p className={styles.heroBody}>
                        Use our free all-in-one creation engine to build anything you can imagine
                      </p>
                    </div>
                    <button className={styles.heroBtn}>
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                  <button className={styles.heroCloseBtn} aria-label="Dismiss banner">
                    <X size={14} />
                  </button>
                </div>}

                {/* ── Experiences section — branched on isNewUser ─── */}
                {/* Shared section header */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.expSectionLeft}>
                      <h2 className={styles.sectionTitle}>Experiences</h2>
                      <button
                        className={styles.expViewAllChevron}
                        onClick={() => navigate('/creations')}
                        aria-label="View all experiences"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                    <button
                      className={styles.expCreateBtn}
                      onClick={() => navigate('/creations')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3z"/>
                      </svg>
                      Create Experience
                    </button>
                  </div>

                  {/* ── New-user layout: 2-column grid ── */}
                  {isNewUser ? (
                    <div className={styles.newUserExpGrid}>

                      {/* Card 1: Starter Place */}
                      <div
                        className={styles.starterCard}
                        onClick={() => navigate('/experience/overview')}
                        role="link"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/experience/overview')}
                      >
                        {/* Main body */}
                        <div className={styles.starterCardBody}>
                          {/* Header row */}
                          <div className={styles.starterCardHeader}>
                            <div className={styles.starterCardLeading}>
                              <div className={styles.starterThumbWrap} aria-hidden="true">🌿</div>
                              <span className={styles.starterCardTitle}>Tyler's Starter Place</span>
                            </div>
                            <button
                              className={styles.expCardMenu}
                              aria-label="More options"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </div>

                          {/* Highlight stat */}
                          <div className={styles.starterStatHighlight}>
                            <span className={styles.starterStatLabel}>Concurrent users</span>
                            <span className={styles.starterStatValue}>3</span>
                          </div>

                          {/* Secondary stats */}
                          <div className={styles.starterStatList}>
                            {[
                              { label: 'Daily active users' },
                              { label: 'D1 retention' },
                              { label: 'Daily revenue' },
                              { label: 'Avg. playtime' },
                            ].map((s) => (
                              <div key={s.label} className={styles.starterStatRow}>
                                <span className={styles.starterStatRowLabel}>{s.label}</span>
                                <span className={styles.starterStatRowValue}>--</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer: sponsored ads CTA */}
                        <div className={styles.starterCardFooter}>
                          <Zap size={18} className={styles.starterFooterIcon} fill="currentColor" />
                          <div className={styles.starterFooterText}>
                            <span className={styles.starterFooterTitle}>Try sponsored ads</span>
                            <span className={styles.starterFooterDesc}>
                              Promote your experiences to audiences that would enjoy it
                            </span>
                          </div>
                          <ChevronRight size={16} className={styles.starterFooterChevron} />
                        </div>
                      </div>

                      {/* Card 2: Watchlist empty state */}
                      <div className={styles.watchlistCard}>
                        <button className={styles.watchlistCardClose} aria-label="Close">
                          <X size={14} />
                        </button>

                        {/* Gamepad illustration */}
                        <div className={styles.watchlistIllo}>
                          <Gamepad2 size={36} className={styles.watchlistIlloIcon} />
                        </div>

                        <h3 className={styles.watchlistCardTitle}>Add to watchlist</h3>
                        <p className={styles.watchlistCardDesc}>
                          Monitor performance and user engagement
                        </p>
                        <button className={styles.viewAllBtn}>Add experiences</button>
                      </div>

                    </div>
                  ) : (

                  /* ── Returning-user carousel ── */
                  <div className={styles.expCarouselWrap}>

                    <button
                      className={`${styles.expArrow} ${styles.expArrowLeft}`}
                      onClick={() => scrollExp('left')}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className={styles.expCarousel} ref={expScrollRef}>

                      {EXPERIENCES_DATA.map((exp) => (
                        <div key={exp.id} className={styles.expCard}>
                          <div
                            className={styles.expCardInner}
                            onClick={() => navigate(exp.overviewLink)}
                            role="link"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(exp.overviewLink)}
                          >
                            <div className={styles.expCardTop}>
                              <span className={styles.expVisiBadge}>{exp.visibility}</span>
                              <button
                                className={styles.expCardMenu}
                                aria-label="More options"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal size={14} />
                              </button>
                            </div>
                            <div className={styles.expCardMid}>
                              <img src={exp.thumbnail} alt={exp.title} className={styles.expCardThumb} width={24} height={24} />
                              <span className={styles.expCardTitle}>{exp.title}</span>
                            </div>
                            <div className={styles.expCardStats}>
                              <span className={styles.expStatLabel}>Concurrent users</span>
                              <span className={styles.expStatValue}>{exp.concurrentUsers}</span>
                            </div>
                            <div className={styles.expCardSecondary}>
                              {[
                                { label: 'Daily active users', value: exp.dau },
                                { label: 'D1 retention',       value: exp.d1Retention },
                                { label: 'Daily revenue',      value: exp.dailyRevenue },
                                { label: 'Avg. playtime',      value: exp.avgPlaytime },
                              ].map((s) => (
                                <div key={s.label} className={styles.expStatRow}>
                                  <span className={styles.expStatRowLabel}>{s.label}</span>
                                  <span className={styles.expStatRowValue}>{s.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className={styles.expCardHoverBar}>
                            <button className={styles.expHoverBtnPrimary}>Open Studio</button>
                            <button className={styles.expHoverBtnSecondary} onClick={() => navigate(exp.overviewLink)}>View details</button>
                          </div>
                        </div>
                      ))}

                      <div
                        className={`${styles.expCard} ${styles.expCardViewAll}`}
                        onClick={() => navigate('/creations')}
                        role="link"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate('/creations')}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ opacity: 0.55 }}>
                          <path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/>
                        </svg>
                        <span className={styles.expViewAllTitle}>View all experiences</span>
                        <span className={styles.expViewAllDesc}>Manage your creations on Dashboard</span>
                      </div>

                    </div>

                    <button
                      className={`${styles.expArrow} ${styles.expArrowRight}`}
                      onClick={() => scrollExp('right')}
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={18} />
                    </button>

                  </div>
                  )}{/* end isNewUser */}
                </div>

                {/* Learn section */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Learn</h2>
                    <button className={styles.viewAllBtn}>View all</button>
                  </div>

                  <div className={styles.learnCarouselWrap}>

                    {/* Left arrow */}
                    <button
                      className={`${styles.learnArrow} ${styles.learnArrowLeft}`}
                      onClick={() => scrollLearn('left')}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Scrollable row */}
                    <div className={styles.learnCarousel} ref={learnScrollRef}>
                      {LEARN_DATA.map((item) => (
                        <LearnCard key={item.id} {...item} />
                      ))}
                    </div>

                    {/* Right arrow */}
                    <button
                      className={`${styles.learnArrow} ${styles.learnArrowRight}`}
                      onClick={() => scrollLearn('right')}
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={18} />
                    </button>

                  </div>
                </div>

                {/* ── Explore Creator Hub ───────────────────────────── */}
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Explore Creator Hub</h2>
                  </div>

                  {/* Carousel wrapper — relative so arrow buttons can be absolute */}
                  <div className={styles.exploreCarouselWrap}>

                    {/* Left arrow */}
                    <button
                      className={`${styles.exploreArrow} ${styles.exploreArrowLeft}`}
                      onClick={() => scrollExplore('left')}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Scrollable row */}
                    <div className={styles.exploreCarousel} ref={exploreScrollRef}>
                      {EXPLORE_DATA.map((item) => (
                        <ExploreCard key={item.id} {...item} />
                      ))}
                    </div>

                    {/* Right arrow */}
                    <button
                      className={`${styles.exploreArrow} ${styles.exploreArrowRight}`}
                      onClick={() => scrollExplore('right')}
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={18} />
                    </button>

                  </div>
                </div>

                {/* ── Promo row ─────────────────────────────────────── */}
                <div className={styles.promoRow}>
                  {/* Build on Roblox */}
                  <div className={styles.promoCard}>
                    <div className={styles.promoCardContent}>
                      <h3 className={styles.promoCardTitle}>Build on Roblox and reach millions</h3>
                      <p className={styles.promoCardDesc}>
                        Two new programs to help you turn your vision into a launch-ready game
                        with marketing support, hands-on partners, and a direct line into the Roblox team.
                      </p>
                      <a
                        href="/build"
                        className={styles.promoBtn}
                      >
                        Learn more
                      </a>
                    </div>
                    <img
                      src="https://assets.create.roblox.com/e75d347763edf22481eb96f718b54146e85ad91a/assets/home/build_with_roblox.webp"
                      alt="Build with Roblox"
                      className={styles.promoCardImg}
                    />
                  </div>

                  {/* Browse the Store */}
                  <div className={styles.promoCard}>
                    <div className={styles.promoCardContent}>
                      <h3 className={styles.promoCardTitle}>Browse the Store</h3>
                      <p className={styles.promoCardDesc}>
                        Find models, scripts, and plugins made by other creators
                      </p>
                      <a
                        href="https://create.roblox.com/store"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.promoBtn}
                      >
                        View Items
                      </a>
                    </div>
                    <img
                      src="https://assets.create.roblox.com/e75d347763edf22481eb96f718b54146e85ad91a/assets/home/browse_store_dark.webp"
                      alt="Browse the Store"
                      className={styles.promoCardImg}
                    />
                  </div>
                </div>

                {/* ── Community section ─────────────────────────────── */}
                <div className={styles.communitySection}>

                  {/* Left: text + links */}
                  <div className={styles.communityLeft}>
                    <div className={styles.communityText}>
                      <h2 className={styles.communityTitle}>You're part of the community</h2>
                      <p className={styles.communityDesc}>
                        Our community of award-winning studios and self-taught creators all started here, just like you.
                      </p>
                    </div>
                    <div className={styles.communityLinks}>
                      <a href="#" className={styles.communityLink}>
                        <MessageCircle size={16} className={styles.communityLinkIcon} />
                        Join the Community Forum
                      </a>
                      <a href="#" className={styles.communityLink}>
                        <Calendar size={16} className={styles.communityLinkIcon} />
                        View Community Events
                      </a>
                    </div>
                  </div>

                  {/* Center + Right: Shorts carousel */}
                  <div className={styles.communityCarousel}>

                    {/* Live YouTube Shorts embed — switches with active video */}
                    <div className={styles.shortsPlayer}>
                      <iframe
                        key={activeVideo.youtubeId}
                        src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={activeVideo.name}
                        className={styles.shortsIframe}
                      />
                    </div>

                    {/* Creator / video list */}
                    <div className={styles.creatorList}>
                      {COMMUNITY_VIDEOS.map((video) => (
                        <div
                          key={video.id}
                          className={`${styles.creatorItem} ${activeVideo.id === video.id ? styles.creatorItemActive : ''}`}
                          onClick={() => setActiveVideo(video)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && setActiveVideo(video)}
                          aria-pressed={activeVideo.id === video.id}
                        >
                          <div className={styles.creatorThumbWrap}>
                            <img src={video.thumb} alt={video.name} className={styles.creatorThumb} />
                          </div>
                          <div className={styles.creatorContent}>
                            <span className={styles.creatorName}>{video.name}</span>
                            <p className={styles.creatorDesc}>{video.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>{/* end .communityCarousel */}

                </div>

                {/* ── Global Footer ──────────────────────────────────── */}
                <footer className={styles.pageFooter}>
                  <div className={styles.footerLeft}>
                    <span className={styles.footerCopy}>©2026 Roblox Corporation. All rights reserved.</span>
                    <nav className={styles.footerLinks}>
                      {['Terms', 'Privacy', 'Accessibility', 'Support', 'Your Privacy Choices'].map((l) => (
                        <a key={l} href="#" className={styles.footerLink}>{l}</a>
                      ))}
                    </nav>
                  </div>
                  <div className={styles.footerRight}>
                    <div className={styles.footerSocials}>
                      {/* X / Twitter */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="X / Twitter">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.858L1.79 2.25H8.02l4.264 5.637 5.96-5.637Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                      {/* Facebook */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="Facebook">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.79-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
                      </a>
                      {/* LinkedIn */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="LinkedIn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                      {/* Instagram */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="Instagram">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                      </a>
                      {/* YouTube */}
                      <a href="#" className={styles.footerSocialBtn} aria-label="YouTube">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                      </a>
                    </div>
                    <button className={styles.footerLangBtn}>
                      <Globe size={13} />
                      English
                    </button>
                  </div>
                </footer>

              </div>{/* end .mainCol */}

              {/* ── V1: Elastic flex drawer ─────────────────────── */}
              {useV1 && (
                <div className={`${styles.updatesDrawer} ${isUpdatesOpen ? '' : styles.updatesDrawerClosed}`}>
                  <div className={styles.updatesDrawerInner}>
                    <div className={styles.updatesHeader}>
                      <h2 className={styles.updatesTitle}>Updates</h2>
                      <button
                        className={styles.updatesToggleBtn}
                        onClick={() => setIsUpdatesOpen(false)}
                        aria-label="Close updates panel"
                      >
                        <ChevronsRight size={16} />
                      </button>
                    </div>
                    <div className={styles.updatesWidget}>
                      <div className={styles.updatesFilterBar}>
                        <div className={styles.updatesChip}>
                          Featured <ChevronDown size={10} />
                        </div>
                        <button className={styles.updatesViewAll}>View all</button>
                      </div>
                      {UPDATES.map((entry) => (
                        <div key={entry.id} className={styles.updateRow}>
                          <div className={styles.updateContent}>
                            <p className={styles.updateTitle}>{entry.title}</p>
                            <div className={styles.updateMeta}>
                              <div className={styles.updateStats}>
                                <span className={styles.updateStat}><Heart size={11} /> {entry.likes}</span>
                                <span className={styles.updateStat}><MessageSquare size={11} /> {entry.comments}</span>
                              </div>
                              {entry.tags.length > 0 && (
                                <div className={styles.updateTags}>
                                  {entry.tags.map((t) => (
                                    <span key={t} className={styles.updateTag}>{t}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {entry.thumb && <img src={entry.thumb} alt="" className={styles.updateThumb} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


            </div>
          </div>
        </div>
      </div>

      {/* Floating reveal tab — visible in V1 when drawer is closed */}
      <button
        className={`${styles.updatesRevealTab} ${useV1 && !isUpdatesOpen ? styles.updatesRevealTabVisible : ''}`}
        onClick={() => setIsUpdatesOpen(true)}
        aria-label="Open updates panel"
      >
        <ChevronsLeft size={14} />
        <span className={styles.updatesRevealLabel}>Updates</span>
      </button>

    </div>{/* end .shell */}

    {/* ── V2: overlay drawer — OUTSIDE shell so position:fixed stays viewport-relative */}
    {useV2 && (
      <>
        {/* Backdrop dim for V2 */}
        <div
          className={`${styles.overlayBackdrop} ${isUpdatesOpen ? styles.overlayBackdropVisible : ''}`}
          onClick={() => setIsUpdatesOpen(false)}
        />
        {/* Fixed overlay drawer */}
        <div className={`${styles.updatesDrawerOverlay} ${isUpdatesOpen ? '' : styles.updatesDrawerOverlayHidden}`}>
          <div className={styles.updatesDrawerInner}>
            <div className={styles.updatesHeader}>
              <h2 className={styles.updatesTitle}>Updates</h2>
              <button
                className={styles.updatesToggleBtn}
                onClick={() => setIsUpdatesOpen(false)}
                aria-label="Close updates panel"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
            <div className={`${styles.updatesWidget} ${styles.updatesWidgetOverlay}`}>
              <div className={styles.updatesFilterBar}>
                <div className={styles.updatesChip}>Featured <ChevronDown size={10} /></div>
                <button className={styles.updatesViewAll}>View all</button>
              </div>
              {UPDATES.map((entry) => (
                <div key={entry.id} className={styles.updateRow}>
                  <div className={styles.updateContent}>
                    <p className={styles.updateTitle}>{entry.title}</p>
                    <div className={styles.updateMeta}>
                      <div className={styles.updateStats}>
                        <span className={styles.updateStat}><Heart size={11} /> {entry.likes}</span>
                        <span className={styles.updateStat}><MessageSquare size={11} /> {entry.comments}</span>
                      </div>
                      {entry.tags.length > 0 && (
                        <div className={styles.updateTags}>
                          {entry.tags.map((t) => <span key={t} className={styles.updateTag}>{t}</span>)}
                        </div>
                      )}
                    </div>
                  </div>
                  {entry.thumb && <img src={entry.thumb} alt="" className={styles.updateThumb} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* V2 floating reveal tab — slides in from the right when drawer is closed */}
        <button
          className={`${styles.v2RevealTab} ${!isUpdatesOpen ? styles.v2RevealTabVisible : ''}`}
          onClick={() => setIsUpdatesOpen(true)}
          aria-label="Open updates panel"
        >
          <Megaphone size={14} />
          <span className={styles.v2RevealLabel}>Updates</span>
        </button>
      </>
    )}

    {/* ── Feature Flag Override modal ([ key) — OUTSIDE shell ────────── */}
    {flagMenuOpen && (
      <div
        className={styles.flagModal}
        style={{ left: flagPos.x, top: flagPos.y }}
      >
        {/* Draggable header with Reset button */}
        <div className={styles.flagModalHeader} onMouseDown={onFlagDragStart}>
          <span className={styles.flagModalTitle}>⚑ Feature Flags</span>
          <div className={styles.flagModalHeaderActions}>
            <button className={styles.flagModalReset} onClick={resetFlags} title="Reset to default (V1 Elastic)">
              Reset
            </button>
            <button className={styles.flagModalClose} onClick={() => setFlagMenuOpen(false)} aria-label="Close">
              <X size={13} />
            </button>
          </div>
        </div>
        <p className={styles.flagModalSubtext}>
          Override feature flags locally. Drag around. Only visible to Roblox employees.
        </p>

        {/* ── New User mode toggle ── */}
        <div className={styles.flagToggleRow} style={{ marginBottom: 8 }}>
          <div className={styles.flagToggleInfo}>
            <code className={styles.flagToggleName}>isNewUser</code>
            <span className={styles.flagToggleDesc}>Show empty-state hero + 2-column experience layout</span>
          </div>
          <button
            className={`${styles.flagToggle} ${isNewUser ? styles.flagToggleOn : ''}`}
            onClick={() => setIsNewUser(v => !v)}
            role="switch"
            aria-checked={isNewUser}
          >
            <span className={styles.flagToggleKnob} />
          </button>
        </div>

        {/* ── Collapsible group: Home Dashboard Updates ── */}
        <div className={styles.flagGroup}>
          <button
            className={styles.flagGroupHeader}
            onClick={() => setGroupExpanded(p => !p)}
          >
            <ChevronRight
              size={13}
              className={`${styles.flagGroupChevron} ${groupExpanded ? styles.flagGroupChevronOpen : ''}`}
            />
            <span className={styles.flagGroupLabel}>Home Dashboard Layout</span>
          </button>

          {groupExpanded && (
            <div className={styles.flagGroupChildren}>

              {/* Flag 1 — V1 Elastic */}
              <div className={styles.flagToggleRow}>
                <div className={styles.flagToggleInfo}>
                  <code className={styles.flagToggleName}>useElasticDashboard_V1</code>
                  <span className={styles.flagToggleDesc}>
                    Main content shrinks/grows as Updates opens/closes
                  </span>
                </div>
                <button
                  className={`${styles.flagToggle} ${useV1 ? styles.flagToggleOn : ''}`}
                  onClick={activateV1}
                  role="switch"
                  aria-checked={useV1}
                >
                  <span className={styles.flagToggleKnob} />
                </button>
              </div>

              {/* Flag 2 — V2 Overlay */}
              <div className={styles.flagToggleRow}>
                <div className={styles.flagToggleInfo}>
                  <code className={styles.flagToggleName}>useOverlayUpdates_V2</code>
                  <span className={styles.flagToggleDesc}>
                    Main content stays 100% width; Updates slides over as a layer
                  </span>
                </div>
                <button
                  className={`${styles.flagToggle} ${useV2 ? styles.flagToggleOn : ''}`}
                  onClick={activateV2}
                  role="switch"
                  aria-checked={useV2}
                >
                  <span className={styles.flagToggleKnob} />
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    )}

    {/* ── All Tools flyout panel ─────────────────────────────── */}
    {isAllToolsOpen && (
      <>
        {/* Backdrop — click outside to close */}
        <div
          className={styles.allToolsBackdrop}
          onClick={() => setIsAllToolsOpen(false)}
          aria-hidden="true"
        />

        <div className={styles.allToolsPanel} role="dialog" aria-label="All tools">

          {/* Header */}
          <div className={styles.allToolsHeader}>
            <span className={styles.allToolsTitle}>All tools</span>
            <button
              className={styles.allToolsClose}
              onClick={() => setIsAllToolsOpen(false)}
              aria-label="Close All tools panel"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className={styles.allToolsContent}>

            {/* ── Section 1: Creations / Store ── */}
            <div className={styles.allToolsSection}>
              <div className={styles.allToolsGrid}>
                {/* Col 1 */}
                <div className={styles.allToolsCol}>
                  <span className={styles.allToolsCatHeader}>Creations</span>
                  {['Experiences', 'Avatar Items', 'Development Items', 'Share Links'].map(l => (
                    <a key={l} href="#" className={styles.allToolsLink}>{l}</a>
                  ))}
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsLinkTop}`}>API Keys</a>
                  <a href="#" className={styles.allToolsLink}>OAuth 2.0 Apps</a>
                </div>
                {/* Col 2 */}
                <div className={styles.allToolsCol}>
                  <span className={styles.allToolsCatHeader}>Store</span>
                  {['Models', 'Plugins', 'Audio', 'Decals'].map(l => (
                    <a key={l} href="#" className={styles.allToolsLink}>{l}</a>
                  ))}
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsLinkTop}`}>Licenses</a>
                  <a href="#" className={styles.allToolsLink}>Translation</a>
                </div>
              </div>
            </div>

            {/* ── Section 2: Finance / Ads ── */}
            <div className={styles.allToolsSection}>
              <div className={styles.allToolsGrid}>
                {/* Col 1 */}
                <div className={styles.allToolsCol}>
                  <span className={styles.allToolsCatHeader}>Finance</span>
                  {['DevEx', 'Payouts', 'Transactions'].map(l => (
                    <a key={l} href="#" className={styles.allToolsLink}>{l}</a>
                  ))}
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsLinkTop}`}>Analytics</a>
                </div>
                {/* Col 2 */}
                <div className={styles.allToolsCol}>
                  <span className={styles.allToolsCatHeader}>Ads</span>
                  <a href="#" className={styles.allToolsLink}>Ads Manager</a>
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsLinkExternal}`}>
                    Sponsored Items
                    <ExternalLink size={11} className={styles.allToolsExternalIcon} />
                  </a>
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsLinkTop}`}>Intellectual Property</a>
                </div>
              </div>
            </div>

            {/* ── Section 3: Learn / Community ── */}
            <div className={`${styles.allToolsSection} ${styles.allToolsSectionLast}`}>
              <div className={styles.allToolsGrid}>
                {/* Col 1 */}
                <div className={styles.allToolsCol}>
                  <span className={styles.allToolsCatHeader}>Learn</span>
                  {['Get Started', 'Tutorials', 'Engine API', 'Open Cloud API'].map(l => (
                    <a key={l} href="#" className={styles.allToolsLink}>{l}</a>
                  ))}
                </div>
                {/* Col 2 */}
                <div className={styles.allToolsCol}>
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsStandaloneLink}`}>Forum</a>
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsStandaloneLink} ${styles.allToolsLinkWithBadge}`}>
                    Creator programs
                    <span className={styles.allToolsNewBadge}>New</span>
                  </a>
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsStandaloneLink}`}>Talent</a>
                  <a href="#" className={`${styles.allToolsLink} ${styles.allToolsStandaloneLink}`}>Roadmap</a>
                </div>
              </div>
            </div>

          </div>{/* end allToolsContent */}
        </div>
      </>
    )}

    </>
  );
}
