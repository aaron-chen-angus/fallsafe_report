/* FallSafe+ Report Generator — exercise library
 * Source: "Static Balance Exercises V1" and "Dynamic Balance Exercises V1"
 * (FallSafe+ biomechanical exercise reports). Domain weights (0–1) express how strongly each
 * exercise loads Static Balance (SB), Dynamic Balance (DB), Proprioception (PR) and Coordination (CO).
 * unit: 'hold' (seconds, per side) | 'reps' (per side/direction) | 'passes' (≈5 m walk lengths)
 */
(function (root) {
  'use strict';
  const FS = (root.FS = root.FS || {});

  FS.EXERCISES = [
    /* ===================== STATIC BALANCE ===================== */
    {
      id: 'S1', type: 'static', w: { SB: 0.8, PR: 0.5, CO: 0.2, DB: 0.1 }, unit: 'hold', base: 10,
      muscles: 'Gluteus maximus · Hamstrings · Erector spinae · Gluteus medius',
      t: {
        en: { name: 'Hip Hinge Hold', purpose: 'Narrow-base postural control with neutral-spine hip hinging.', adl: 'Safer bending to pick up items, reach low cupboards and load laundry.',
          levels: [['Supported tandem hip hinge', 'One foot in front, hold a stable support. Brace the core and hinge at the hips; both feet planted. Hold 10 s.'],
                   ['Tandem hip hinge', 'Stand tall in tandem stance. Push hips back, chest lifted, feet planted. Hold 10 s each side.'],
                   ['Tandem hinge + arm circles', 'In tandem stance hinge back, then make slow arm circles with a straight back. Hold 10 s each side.']] },
        zh: { name: '髋铰链保持', purpose: '在窄支撑面下以中立脊柱进行髋关节铰链的姿势控制训练。', adl: '更安全地弯腰捡物、取低处柜子物品及装洗衣机。',
          levels: [['扶持式前后脚站立髋铰链', '一脚在前，手扶稳固支撑物。收紧核心，以髋部向后屈曲，双脚贴地。保持10秒。'],
                   ['前后脚站立髋铰链', '前后脚站直，臀部向后推，胸部挺起，双脚贴地。每侧保持10秒。'],
                   ['前后脚髋铰链＋手臂画圈', '前后脚站立，臀部后坐呈铰链姿势，再缓慢画手臂圆圈，背部保持挺直。每侧保持10秒。']] },
        ms: { name: 'Tahan Engsel Pinggul', purpose: 'Kawalan postur pada tapak sokongan sempit dengan engsel pinggul dan tulang belakang neutral.', adl: 'Membongkok dengan lebih selamat untuk mengutip barang, mencapai kabinet rendah dan memasukkan kain ke mesin basuh.',
          levels: [['Engsel pinggul tandem berpaut', 'Satu kaki di hadapan, berpaut pada sokongan stabil. Ketatkan teras dan engselkan pinggul; kedua-dua kaki rapat ke lantai. Tahan 10 s.'],
                   ['Engsel pinggul tandem', 'Berdiri tegak dalam kedudukan tandem. Tolak pinggul ke belakang, dada diangkat, kaki tetap di lantai. Tahan 10 s setiap sisi.'],
                   ['Engsel tandem + bulatan lengan', 'Dalam kedudukan tandem, engselkan pinggul ke belakang dan buat bulatan lengan perlahan dengan belakang lurus. Tahan 10 s setiap sisi.']] },
        ta: { name: 'இடுப்பு மடிப்பு நிலைப்பிடிப்பு', purpose: 'குறுகிய ஆதாரத் தளத்தில் நடுநிலை முதுகுடன் இடுப்பை மடக்கி உடல்நிலைக் கட்டுப்பாடு.', adl: 'பொருட்களை எடுக்க, தாழ்வான அலமாரிகளை அடைய, துணி துவைக்கும் இயந்திரத்தில் போட பாதுகாப்பாகக் குனிதல்.',
          levels: [['ஆதாரத்துடன் ஒரே வரிசை நிலை இடுப்பு மடிப்பு', 'ஒரு கால் முன்னால், நிலையான ஆதாரத்தைப் பிடிக்கவும். வயிற்றுத் தசைகளை இறுக்கி இடுப்பிலிருந்து மடக்கவும்; இரு கால்களும் தரையில். 10 வினாடி பிடிக்கவும்.'],
                   ['ஒரே வரிசை நிலை இடுப்பு மடிப்பு', 'ஒரே வரிசை நிலையில் நிமிர்ந்து நிற்கவும். இடுப்பைப் பின்னால் தள்ளி, மார்பை உயர்த்தவும். ஒவ்வொரு பக்கமும் 10 வினாடி.'],
                   ['இடுப்பு மடிப்பு + கை வட்டங்கள்', 'ஒரே வரிசை நிலையில் இடுப்பை மடக்கி, முதுகை நேராக வைத்து மெதுவாகக் கை வட்டங்கள் செய்யவும். ஒவ்வொரு பக்கமும் 10 வினாடி.']] }
      }
    },
    {
      id: 'S2', type: 'static', w: { SB: 0.9, PR: 0.6, CO: 0.1, DB: 0.1 }, unit: 'hold', base: 5,
      muscles: 'Gluteus medius/minimus · Quadratus lumborum · Obliques · Fibularis',
      t: {
        en: { name: 'Lateral Hold with Arm Extension', purpose: 'Frontal-plane (side-sway) control as the centre of mass shifts toward the edge of the base.', adl: 'Reaching sideways at a counter, opening cupboards, turning the head and body while standing.',
          levels: [['Wide stance, eyes open', 'Feet wide, knees soft, core braced. Raise one arm sideways to shoulder height. Hold 5 s.'],
                   ['Hip-width stance with side tilt', 'Feet hip-width, knees bent. Tilt head and trunk to one side and lift one arm sideways. Hold 5 s.'],
                   ['Tandem stance, eyes closed', 'Tandem stance, knees bent, core braced. Tilt head and trunk, raise one arm, close eyes. Hold 5 s each side.']] },
        zh: { name: '侧向保持伸臂', purpose: '在重心移向支撑面边缘时训练额状面（左右摇摆）控制。', adl: '在台面旁侧身取物、开柜门、站立时转头转身。',
          levels: [['宽距站立、睁眼', '双脚分开较宽，膝微屈，收紧核心。单臂侧举至肩高。保持5秒。'],
                   ['与髋同宽站立并侧倾', '双脚与髋同宽，膝微屈。头部和躯干侧倾，同时单臂侧举。保持5秒。'],
                   ['前后脚站立、闭眼', '前后脚站立，膝微屈，收紧核心。头和躯干侧倾、单臂上举并闭眼。每侧保持5秒。']] },
        ms: { name: 'Tahan Sisi dengan Lengan Dihulur', purpose: 'Kawalan satah frontal (goyangan sisi) apabila pusat jisim beralih ke tepi tapak sokongan.', adl: 'Mencapai ke sisi di kaunter, membuka kabinet, memusingkan kepala dan badan semasa berdiri.',
          levels: [['Kaki lebar, mata terbuka', 'Kaki dibuka luas, lutut sedikit bengkok, teras ketat. Angkat satu lengan ke sisi paras bahu. Tahan 5 s.'],
                   ['Kaki selebar pinggul dengan condong sisi', 'Kaki selebar pinggul, lutut bengkok. Condongkan kepala dan badan ke satu sisi dan angkat satu lengan. Tahan 5 s.'],
                   ['Kedudukan tandem, mata tertutup', 'Kedudukan tandem, lutut bengkok, teras ketat. Condongkan kepala dan badan, angkat lengan, pejamkan mata. Tahan 5 s setiap sisi.']] },
        ta: { name: 'கையை நீட்டிய பக்கவாட்டு நிலைப்பிடிப்பு', purpose: 'உடல் எடை மையம் ஆதாரத் தளத்தின் விளிம்புக்கு நகரும்போது பக்கவாட்டு அசைவுக் கட்டுப்பாடு.', adl: 'மேசை அருகே பக்கவாட்டில் எட்டுதல், அலமாரி திறத்தல், நின்றபடி தலை மற்றும் உடலைத் திருப்புதல்.',
          levels: [['அகன்ற நிலை, கண்கள் திறந்து', 'கால்களை அகலமாக வைத்து, முழங்கால்களை மென்மையாக மடக்கவும். ஒரு கையைத் தோள் உயரத்துக்குப் பக்கவாட்டில் உயர்த்தவும். 5 வினாடி.'],
                   ['இடுப்பு அகல நிலை, பக்கச் சாய்வு', 'இடுப்பு அகலத்தில் கால்கள். தலை மற்றும் உடலை ஒரு பக்கம் சாய்த்து ஒரு கையை உயர்த்தவும். 5 வினாடி.'],
                   ['ஒரே வரிசை நிலை, கண்கள் மூடி', 'ஒரே வரிசை நிலையில் முழங்கால்களை மடக்கி, தலை-உடலைச் சாய்த்து, கையை உயர்த்தி கண்களை மூடவும். ஒவ்வொரு பக்கமும் 5 வினாடி.']] }
      }
    },
    {
      id: 'S3', type: 'static', w: { SB: 0.8, PR: 0.8, CO: 0.2, DB: 0.1 }, unit: 'reps', base: 8,
      muscles: 'Gastrocnemius–soleus · Tibialis anterior · Intrinsic foot muscles',
      t: {
        en: { name: 'Slow Heel-Toe Rock with Directional Turns', purpose: 'Trains the ankle strategy and controlled anterior–posterior centre-of-pressure shifts.', adl: 'Standing balance when reaching forward/back, stopping, starting and looking around in a queue or at a crossing.',
          levels: [['Heel-toe shift, hip-width', 'Feet hip-width apart. Slowly rock forward onto the toes, then back onto the heels.'],
                   ['Heel-toe rock, feet together', 'Feet together. Slowly rock forward onto the toes and back onto the heels.'],
                   ['Feet together + head turns', 'Feet together, rock slowly toes-to-heels while turning the head left, centre and right.']] },
        zh: { name: '缓慢脚跟脚尖摇摆＋转头', purpose: '训练踝关节策略与前后方向的压力中心控制。', adl: '前伸或后取物、起步停步、排队或过马路时环顾四周的站立平衡。',
          levels: [['与髋同宽脚跟脚尖重心转移', '双脚与髋同宽。缓慢向前移至脚尖，再向后移至脚跟。'],
                   ['并脚脚跟脚尖摇摆', '双脚并拢。缓慢向前摇至脚尖，再向后摇至脚跟。'],
                   ['并脚摇摆＋左右转头', '双脚并拢，缓慢前后摇摆，同时头部向左、回中、向右转动。']] },
        ms: { name: 'Hayun Tumit-Jari Perlahan dengan Pusingan Arah', purpose: 'Melatih strategi buku lali dan anjakan pusat tekanan depan–belakang yang terkawal.', adl: 'Keseimbangan berdiri ketika mencapai ke depan/belakang, berhenti, bermula dan memandang sekeliling semasa beratur atau melintas jalan.',
          levels: [['Anjakan tumit-jari, selebar pinggul', 'Kaki selebar pinggul. Hayun perlahan ke hadapan ke hujung jari, kemudian ke belakang ke tumit.'],
                   ['Hayun tumit-jari, kaki rapat', 'Kaki dirapatkan. Hayun perlahan ke hujung jari dan kembali ke tumit.'],
                   ['Kaki rapat + pusing kepala', 'Kaki rapat, hayun perlahan sambil memusingkan kepala ke kiri, tengah dan kanan.']] },
        ta: { name: 'மெதுவான குதிகால்-விரல் ஆட்டம் மற்றும் தலைத் திருப்பம்', purpose: 'கணுக்கால் உத்தியையும் முன்-பின் அழுத்த மைய மாற்றங்களையும் பயிற்றுவிக்கிறது.', adl: 'முன்/பின் எட்டுதல், நிறுத்துதல், தொடங்குதல், வரிசையில் அல்லது சாலை கடக்கும்போது சுற்றிப் பார்த்தல்.',
          levels: [['இடுப்பு அகல குதிகால்-விரல் மாற்றம்', 'இடுப்பு அகலத்தில் கால்கள். மெதுவாக விரல்களுக்கு முன்னும், பின் குதிகால்களுக்கும் ஆடவும்.'],
                   ['கால்கள் சேர்த்து குதிகால்-விரல் ஆட்டம்', 'கால்களைச் சேர்த்து வைத்து மெதுவாக விரல்களுக்கும் குதிகால்களுக்கும் ஆடவும்.'],
                   ['கால்கள் சேர்த்து + தலைத் திருப்பம்', 'கால்களைச் சேர்த்து ஆடியபடி தலையை இடம், நடு, வலம் மெதுவாகத் திருப்பவும்.']] }
      }
    },
    {
      id: 'S4', type: 'static', w: { SB: 0.7, CO: 0.5, PR: 0.3, DB: 0.1 }, unit: 'reps', base: 8,
      muscles: 'Obliques · Multifidus · Gluteus medius · Deltoids',
      t: {
        en: { name: 'Sumo Stance with Tai Chi Arm Movement', purpose: 'Safe wide-base entry drill: trunk anti-rotation with slow upper-body perturbation.', adl: 'Standing while using the arms — washing dishes, folding clothes, wiping a table.',
          levels: [['Sumo hold, shoulder guidance', 'Stand wide and upright. Swing the hands side to side without rotating the hips.'],
                   ['Sumo with slow arm sweeps', 'Stand wide and upright. Sweep both arms slowly from right to left.'],
                   ['Sumo, eyes closed, Tai Chi arms', 'Wide stance, eyes closed, arms in front. Sweep the arms slowly right and left.']] },
        zh: { name: '相扑站姿太极手臂动作', purpose: '安全的宽支撑入门练习：躯干抗旋转配合缓慢上肢扰动。', adl: '站立使用双手时的平衡——洗碗、叠衣服、擦桌子。',
          levels: [['相扑站姿＋肩部引导', '双脚宽站、身体挺直。双手左右摆动，髋部不转动。'],
                   ['相扑站姿缓慢扫臂', '双脚宽站、身体挺直。双臂缓慢由右向左扫动。'],
                   ['相扑站姿闭眼太极手', '宽站、闭眼、双臂在前。缓慢左右扫动双臂。']] },
        ms: { name: 'Kedudukan Sumo dengan Gerakan Lengan Tai Chi', purpose: 'Latihan permulaan tapak lebar yang selamat: anti-putaran badan dengan gangguan perlahan bahagian atas badan.', adl: 'Berdiri sambil menggunakan tangan — membasuh pinggan, melipat pakaian, mengelap meja.',
          levels: [['Tahan sumo, panduan bahu', 'Berdiri luas dan tegak. Hayun tangan ke kiri dan kanan tanpa memusingkan pinggul.'],
                   ['Sumo dengan sapuan lengan perlahan', 'Berdiri luas dan tegak. Sapu kedua-dua lengan perlahan dari kanan ke kiri.'],
                   ['Sumo, mata tertutup, lengan Tai Chi', 'Kedudukan luas, mata tertutup, lengan di hadapan. Sapu lengan perlahan ke kanan dan kiri.']] },
        ta: { name: 'சுமோ நிலையில் டாய் சி கை அசைவு', purpose: 'பாதுகாப்பான அகன்ற-தள தொடக்கப் பயிற்சி: மேல் உடல் மெதுவான அசைவுடன் உடல் சுழற்சி எதிர்ப்பு.', adl: 'கைகளைப் பயன்படுத்தி நிற்கும் பணிகள் — பாத்திரம் கழுவுதல், துணி மடித்தல், மேசை துடைத்தல்.',
          levels: [['சுமோ நிலை, தோள் வழிகாட்டல்', 'அகலமாக நிமிர்ந்து நிற்கவும். இடுப்பைச் சுழற்றாமல் கைகளை இருபுறமும் ஆட்டவும்.'],
                   ['சுமோ நிலையில் மெதுவான கை வீச்சு', 'அகலமாக நிமிர்ந்து நின்று இரு கைகளையும் வலமிருந்து இடமாக மெதுவாக வீசவும்.'],
                   ['சுமோ, கண்கள் மூடி, டாய் சி கைகள்', 'அகன்ற நிலை, கண்கள் மூடி, கைகள் முன்னால். கைகளை மெதுவாக வலம்-இடமாக வீசவும்.']] }
      }
    },
    {
      id: 'S5', type: 'static', w: { SB: 0.8, PR: 0.3, CO: 0.2, DB: 0.1 }, unit: 'hold', base: 15,
      muscles: 'Deltoids · Rotator cuff · Serratus anterior · Core · Hip abductors',
      t: {
        en: { name: 'Iron Cross Hold', purpose: 'Isometric arm load combined with whole-body postural stiffness on a narrowing base.', adl: 'Holding or carrying groceries, laundry or water bottles while standing.',
          levels: [['Hip-width hold with two light objects', 'Feet hip-width, body tall. Raise both arms to shoulder height, palms forward, elbows straight but not locked. Hold.'],
                   ['Instep stance dual-load hold', 'Instep stance (one foot slightly ahead), body tall. Raise both arms to shoulder height, palms forward. Hold.'],
                   ['Tandem stance dual-load Iron Cross', 'Tandem stance, body tall. Raise both loaded arms to shoulder height, palms forward. Hold.']] },
        zh: { name: '铁十字保持', purpose: '上肢等长负荷结合逐渐变窄支撑面下的全身姿势稳定。', adl: '站立时提购物袋、衣物或水瓶。',
          levels: [['与髋同宽持两件轻物', '双脚与髋同宽，身体挺直。双臂侧平举至肩高，掌心向前，肘伸直但不锁死。保持。'],
                   ['半前后脚站立双侧负荷', '一脚稍在前，身体挺直。双臂举至肩高，掌心向前。保持。'],
                   ['前后脚站立负重铁十字', '前后脚站立，身体挺直。双臂持物举至肩高，掌心向前。保持。']] },
        ms: { name: 'Tahan Iron Cross', purpose: 'Beban isometrik lengan digabung dengan kestabilan postur seluruh badan pada tapak yang semakin sempit.', adl: 'Memegang atau membawa barang runcit, pakaian atau botol air semasa berdiri.',
          levels: [['Tahan selebar pinggul dengan dua objek ringan', 'Kaki selebar pinggul, badan tegak. Angkat kedua-dua lengan ke paras bahu, tapak tangan ke hadapan, siku lurus tetapi tidak dikunci. Tahan.'],
                   ['Tahan dwi-beban kedudukan instep', 'Satu kaki sedikit ke hadapan, badan tegak. Angkat kedua-dua lengan ke paras bahu. Tahan.'],
                   ['Iron Cross dwi-beban tandem', 'Kedudukan tandem, badan tegak. Angkat kedua-dua lengan berbeban ke paras bahu. Tahan.']] },
        ta: { name: 'இரும்புச் சிலுவை நிலைப்பிடிப்பு', purpose: 'குறுகும் ஆதாரத் தளத்தில் கைகளின் சம-நீள சுமையுடன் முழு உடல் நிலைத்தன்மை.', adl: 'நின்றபடி மளிகைப் பைகள், துணிகள், தண்ணீர் பாட்டில்களைப் பிடித்தல் அல்லது தூக்குதல்.',
          levels: [['இடுப்பு அகலத்தில் இரண்டு லேசான பொருட்களுடன்', 'இடுப்பு அகலத்தில் கால்கள். இரு கைகளையும் தோள் உயரத்துக்கு உயர்த்தி, உள்ளங்கை முன்னோக்கி, முழங்கை நேராக. பிடிக்கவும்.'],
                   ['அரை-வரிசை நிலையில் இரட்டைச் சுமை', 'ஒரு கால் சற்று முன்னால், நிமிர்ந்து நின்று இரு கைகளையும் தோள் உயரத்துக்கு உயர்த்தவும். பிடிக்கவும்.'],
                   ['ஒரே வரிசை நிலை இரும்புச் சிலுவை', 'ஒரே வரிசை நிலையில் சுமையுடன் இரு கைகளையும் தோள் உயரத்துக்கு உயர்த்திப் பிடிக்கவும்.']] }
      }
    },
    {
      id: 'S6', type: 'static', w: { SB: 0.7, CO: 0.5, PR: 0.4, DB: 0.1 }, unit: 'reps', base: 6,
      muscles: 'Internal/external obliques · Multifidus · Deep hip rotators',
      t: {
        en: { name: 'Instep Stance with Torso Rotations', purpose: 'Transverse-plane trunk control over a fixed pelvis as the base narrows.', adl: 'Looking behind, reaching across the body, turning to speak to someone with feet planted.',
          levels: [['Wide stance rotations', 'Feet wide, hands on hips. Slowly rotate the torso clockwise and anticlockwise.'],
                   ['Feet-together rotations', 'Feet together, hands on hips. Slowly rotate the torso clockwise and anticlockwise.'],
                   ['Instep stance rotations', 'One foot in front of the other, hands on hips. Slowly rotate the torso both ways.']] },
        zh: { name: '半前后脚站立躯干旋转', purpose: '在支撑面变窄时，于固定骨盆上进行水平面躯干控制。', adl: '双脚不动时回头看、跨身取物、转身与人交谈。',
          levels: [['宽站躯干旋转', '双脚宽站，双手叉腰。缓慢顺时针及逆时针转动躯干。'],
                   ['并脚躯干旋转', '双脚并拢，双手叉腰。缓慢顺、逆时针转动躯干。'],
                   ['半前后脚躯干旋转', '一脚在另一脚前方，双手叉腰。缓慢双向转动躯干。']] },
        ms: { name: 'Kedudukan Instep dengan Putaran Badan', purpose: 'Kawalan badan satah melintang di atas pelvis yang tetap apabila tapak semakin sempit.', adl: 'Menoleh ke belakang, mencapai merentasi badan, berpaling untuk bercakap tanpa mengalihkan kaki.',
          levels: [['Putaran kaki lebar', 'Kaki lebar, tangan di pinggang. Putar badan perlahan mengikut dan melawan arah jam.'],
                   ['Putaran kaki rapat', 'Kaki rapat, tangan di pinggang. Putar badan perlahan ke kedua-dua arah.'],
                   ['Putaran kedudukan instep', 'Satu kaki di hadapan kaki yang lain, tangan di pinggang. Putar badan perlahan ke kedua-dua arah.']] },
        ta: { name: 'அரை-வரிசை நிலையில் உடல் சுழற்சி', purpose: 'ஆதாரத் தளம் குறுகும்போது நிலையான இடுப்பின் மேல் கிடைமட்டத் தள உடல் கட்டுப்பாடு.', adl: 'கால்களை அசைக்காமல் பின்னால் பார்த்தல், உடல் குறுக்கே எட்டுதல், ஒருவரிடம் பேசத் திரும்புதல்.',
          levels: [['அகன்ற நிலை சுழற்சி', 'கால்கள் அகலமாக, கைகள் இடுப்பில். உடலைக் கடிகாரத் திசையிலும் எதிர்த் திசையிலும் மெதுவாகச் சுழற்றவும்.'],
                   ['கால்கள் சேர்த்து சுழற்சி', 'கால்களைச் சேர்த்து, கைகள் இடுப்பில். உடலை இரு திசைகளிலும் மெதுவாகச் சுழற்றவும்.'],
                   ['அரை-வரிசை நிலை சுழற்சி', 'ஒரு கால் மற்றொன்றின் முன். கைகள் இடுப்பில். உடலை இரு திசைகளிலும் மெதுவாகச் சுழற்றவும்.']] }
      }
    },
    {
      id: 'S7', type: 'static', w: { SB: 0.8, CO: 0.5, PR: 0.3, DB: 0.1 }, unit: 'reps', base: 8,
      muscles: 'Deltoids · Rotator cuff · Trapezius · Core · Gluteus medius',
      t: {
        en: { name: 'Overhead Arm Circles', purpose: 'Static balance under repeated upper-limb perturbation with an elevated centre of mass.', adl: 'Reaching to high shelves, hanging clothes, dressing and washing hair.',
          levels: [['Neutral stance', 'Feet hip-width. Raise arms overhead (beside the ears) and make slow circles, elbows straight.'],
                   ['Instep stance', 'One foot slightly in front. Raise arms overhead and make slow circles, elbows straight but not locked.'],
                   ['Tandem stance', 'One foot directly in front of the other. Raise arms overhead and make slow circles.']] },
        zh: { name: '头顶手臂画圈', purpose: '重心升高时在反复上肢扰动下维持静态平衡。', adl: '够取高处物品、晾衣服、穿衣、洗头。',
          levels: [['自然站立', '双脚与髋同宽。双臂举过头顶（贴近耳旁）缓慢画圈，肘部伸直。'],
                   ['半前后脚站立', '一脚稍在前。双臂举过头顶缓慢画圈，肘伸直但不锁死。'],
                   ['前后脚站立', '一脚正对另一脚前方。双臂举过头顶缓慢画圈。']] },
        ms: { name: 'Bulatan Lengan Atas Kepala', purpose: 'Keseimbangan statik dengan gangguan berulang anggota atas dan pusat jisim yang lebih tinggi.', adl: 'Mencapai rak tinggi, menyidai pakaian, berpakaian dan mencuci rambut.',
          levels: [['Kedudukan neutral', 'Kaki selebar pinggul. Angkat lengan ke atas kepala (di sisi telinga) dan buat bulatan perlahan, siku lurus.'],
                   ['Kedudukan instep', 'Satu kaki sedikit ke hadapan. Angkat lengan ke atas kepala dan buat bulatan perlahan.'],
                   ['Kedudukan tandem', 'Satu kaki tepat di hadapan kaki yang lain. Angkat lengan dan buat bulatan perlahan.']] },
        ta: { name: 'தலைக்கு மேல் கை வட்டங்கள்', purpose: 'உயர்ந்த எடை மையத்துடன் தொடர்ச்சியான கை அசைவுகளின் கீழ் நிலையான சமநிலை.', adl: 'உயர்ந்த அலமாரிகளை எட்டுதல், துணி காயப்போடுதல், உடை அணிதல், தலைமுடி கழுவுதல்.',
          levels: [['இயல்பு நிலை', 'இடுப்பு அகலத்தில் கால்கள். கைகளைத் தலைக்கு மேல் (காதுகளுக்கு அருகில்) உயர்த்தி மெதுவாக வட்டமிடவும்.'],
                   ['அரை-வரிசை நிலை', 'ஒரு கால் சற்று முன்னால். கைகளை மேலே உயர்த்தி மெதுவாக வட்டமிடவும்.'],
                   ['ஒரே வரிசை நிலை', 'ஒரு கால் நேரடியாக மற்றொன்றின் முன். கைகளை மேலே உயர்த்தி மெதுவாக வட்டமிடவும்.']] }
      }
    },
    {
      id: 'S8', type: 'static', w: { SB: 1.0, PR: 0.7, DB: 0.4, CO: 0.2 }, unit: 'hold', base: 10,
      muscles: 'Gluteus medius/minimus · Quadriceps · Gastrocnemius–soleus · Tibialis posterior',
      t: {
        en: { name: 'Single-Legged Hold', purpose: 'Graded progression to single-limb stance — the balance demand of every walking step.', adl: 'Gait, stairs, stepping into clothing and stepping over small objects.',
          levels: [['Instep stance hold', 'One foot slightly in front, hands on hips. Stay upright and hold with controlled weight.'],
                   ['Toe-touch hold', 'Shift weight onto one leg; the other toes lightly touch the floor. Hips level, hands on hips.'],
                   ['Single-leg hold', 'Hands on hips. Lift one foot slightly and hold, then switch. Hips level, trunk upright.']] },
        zh: { name: '单腿站立保持', purpose: '循序渐进过渡至单腿支撑——每一步行走所需的平衡能力。', adl: '步行、上下楼梯、穿裤子、跨过小物件。',
          levels: [['半前后脚站立保持', '一脚稍在前，双手叉腰。保持身体挺直，控制重心。'],
                   ['脚尖点地保持', '重心移至一腿，另一脚脚尖轻触地面。骨盆水平，双手叉腰。'],
                   ['单腿站立', '双手叉腰。一脚稍离地保持，然后换腿。骨盆水平，躯干挺直。']] },
        ms: { name: 'Tahan Satu Kaki', purpose: 'Perkembangan berperingkat ke dirian satu kaki — tuntutan keseimbangan setiap langkah berjalan.', adl: 'Berjalan, naik turun tangga, memakai seluar dan melangkah melepasi objek kecil.',
          levels: [['Tahan kedudukan instep', 'Satu kaki sedikit ke hadapan, tangan di pinggang. Kekal tegak dan tahan dengan berat terkawal.'],
                   ['Tahan sentuhan jari', 'Pindahkan berat ke satu kaki; jari kaki satu lagi menyentuh lantai perlahan. Pinggul rata.'],
                   ['Tahan satu kaki', 'Tangan di pinggang. Angkat satu kaki sedikit dan tahan, kemudian tukar. Pinggul rata, badan tegak.']] },
        ta: { name: 'ஒற்றைக் கால் நிலைப்பிடிப்பு', purpose: 'ஒற்றைக் கால் நிலைக்குப் படிப்படியான முன்னேற்றம் — ஒவ்வொரு நடை அடிக்கும் தேவையான சமநிலை.', adl: 'நடத்தல், படிக்கட்டு, உடை அணியக் காலைத் தூக்குதல், சிறு பொருட்களைத் தாண்டுதல்.',
          levels: [['அரை-வரிசை நிலைப்பிடிப்பு', 'ஒரு கால் சற்று முன்னால், கைகள் இடுப்பில். நிமிர்ந்து எடையைக் கட்டுப்படுத்திப் பிடிக்கவும்.'],
                   ['கால்விரல் தொடு நிலை', 'எடையை ஒரு காலுக்கு மாற்றவும்; மற்ற காலின் விரல்கள் தரையை லேசாகத் தொடட்டும். இடுப்பு சமமாக.'],
                   ['ஒற்றைக் கால் நிலை', 'கைகள் இடுப்பில். ஒரு காலைச் சற்று உயர்த்திப் பிடித்து, பின் மாற்றவும். இடுப்பு சமமாக, உடல் நிமிர்ந்து.']] }
      }
    },

    /* ===================== DYNAMIC BALANCE ===================== */
    {
      id: 'D1', type: 'dynamic', w: { DB: 0.8, PR: 0.7, SB: 0.4, CO: 0.4 }, unit: 'passes', base: 3,
      muscles: 'Gluteus medius/minimus · Quadriceps · Gastrocnemius–soleus · Tibialis anterior',
      t: {
        en: { name: 'Forward Tandem Walk', purpose: 'Narrow-base forward gait with precise foot placement and mediolateral control.', adl: 'Walking through corridors, doorways, crowds and between furniture in a straight line.',
          levels: [['Small gap between feet', 'Hands on hips, walk forward with a small gap between the feet. Chest lifted, eyes forward; do not drag the feet.'],
                   ['Heel-to-toe', 'Hands on hips, place one heel directly in front of the opposite toes. Keep each step slow and controlled.'],
                   ['Heel-to-toe, eyes closed', 'Start heel-to-toe walking; close the eyes only when steady. Stay tall and keep the line narrow.']] },
        zh: { name: '向前一字步行', purpose: '窄支撑面向前步行，训练精确落脚及左右方向控制。', adl: '直线通过走廊、门口、人群和家具之间。',
          levels: [['双脚间留小间隙', '双手叉腰，双脚间留小间隙向前走。挺胸、目视前方，不拖脚。'],
                   ['脚跟贴脚尖', '双手叉腰，一脚脚跟放在另一脚脚尖正前方。每步缓慢受控。'],
                   ['脚跟贴脚尖并闭眼', '先以脚跟贴脚尖行走，稳定后才闭眼。身体挺直，保持窄线。']] },
        ms: { name: 'Jalan Tandem ke Hadapan', purpose: 'Gaya berjalan tapak sempit dengan peletakan kaki tepat dan kawalan mediolateral.', adl: 'Berjalan melalui koridor, pintu, orang ramai dan antara perabot dalam garisan lurus.',
          levels: [['Jarak kecil antara kaki', 'Tangan di pinggang, berjalan ke hadapan dengan jarak kecil antara kaki. Dada diangkat; jangan seret kaki.'],
                   ['Tumit-ke-jari', 'Letakkan tumit betul-betul di hadapan jari kaki yang lain. Setiap langkah perlahan dan terkawal.'],
                   ['Tumit-ke-jari, mata tertutup', 'Mulakan jalan tumit-ke-jari; pejamkan mata hanya apabila stabil. Kekal tegak.']] },
        ta: { name: 'முன்னோக்கி ஒரே வரிசை நடை', purpose: 'துல்லியமான கால் வைப்புடன் குறுகிய தள முன்னோக்கு நடை.', adl: 'நடைபாதைகள், வாசல்கள், கூட்டம், தளவாடங்களுக்கு இடையே நேர்கோட்டில் நடத்தல்.',
          levels: [['கால்களுக்கு இடையே சிறு இடைவெளி', 'கைகள் இடுப்பில், சிறு இடைவெளியுடன் முன்னோக்கி நடக்கவும். மார்பை உயர்த்தி, கால்களை இழுக்காதீர்கள்.'],
                   ['குதிகால்-விரல் நடை', 'ஒரு குதிகாலை மற்ற காலின் விரல்களுக்கு நேர் முன் வைக்கவும். ஒவ்வொரு அடியும் மெதுவாக.'],
                   ['குதிகால்-விரல், கண்கள் மூடி', 'குதிகால்-விரல் நடையைத் தொடங்கி, நிலையாக இருக்கும்போது மட்டும் கண்களை மூடவும்.']] }
      }
    },
    {
      id: 'D2', type: 'dynamic', w: { DB: 0.9, SB: 0.3, PR: 0.3, CO: 0.3 }, unit: 'passes', base: 3,
      muscles: 'Gluteus medius/minimus · Hip adductors · Fibularis · Quadratus lumborum',
      t: {
        en: { name: 'Side-Stepping Walk', purpose: 'Lateral stepping and frontal-plane hip stability — a key side-sway recovery strategy.', adl: 'Moving along a kitchen counter, beside a bed, in bathrooms and tight spaces.',
          levels: [['Small side step', 'Hands on hips, feet hip-width, knees straight. Take a small side step, bring the other foot back to hip width. Toes forward.'],
                   ['Medium side step', 'Same set-up. Take a medium side step and control the landing.'],
                   ['Wide side step', 'Same set-up. Take a wide side step; stay tall, slow and balanced.']] },
        zh: { name: '侧向横步走', purpose: '侧向迈步及额状面髋部稳定——侧向失衡恢复的关键策略。', adl: '沿厨房台面、床边、浴室及狭窄空间横向移动。',
          levels: [['小步横移', '双手叉腰，双脚与髋同宽，膝伸直。向侧小步，再收另一脚回到髋宽。脚尖朝前。'],
                   ['中步横移', '同样姿势。向侧迈中步，控制落地。'],
                   ['大步横移', '同样姿势。向侧迈大步，保持挺直、缓慢、平稳。']] },
        ms: { name: 'Jalan Langkah Sisi', purpose: 'Langkah sisi dan kestabilan pinggul satah frontal — strategi utama pemulihan goyangan sisi.', adl: 'Bergerak di sepanjang kaunter dapur, tepi katil, bilik air dan ruang sempit.',
          levels: [['Langkah sisi kecil', 'Tangan di pinggang, kaki selebar pinggul, lutut lurus. Langkah kecil ke sisi, rapatkan kaki satu lagi. Jari kaki ke hadapan.'],
                   ['Langkah sisi sederhana', 'Kedudukan sama. Langkah sederhana ke sisi dan kawal pendaratan.'],
                   ['Langkah sisi lebar', 'Kedudukan sama. Langkah lebar ke sisi; kekal tegak, perlahan dan seimbang.']] },
        ta: { name: 'பக்கவாட்டு அடி நடை', purpose: 'பக்கவாட்டு அடி மற்றும் இடுப்பு நிலைத்தன்மை — பக்கச் சாய்விலிருந்து மீளும் முக்கிய உத்தி.', adl: 'சமையலறை மேடை, படுக்கை அருகே, குளியலறை, குறுகிய இடங்களில் பக்கவாட்டில் நகர்தல்.',
          levels: [['சிறிய பக்க அடி', 'கைகள் இடுப்பில், கால்கள் இடுப்பு அகலத்தில். சிறிய பக்க அடி வைத்து, மற்ற காலைக் கொண்டுவரவும். விரல்கள் முன்னோக்கி.'],
                   ['நடுத்தர பக்க அடி', 'அதே நிலையில் நடுத்தர பக்க அடி வைத்து, தரையிறக்கத்தைக் கட்டுப்படுத்தவும்.'],
                   ['அகன்ற பக்க அடி', 'அதே நிலையில் அகன்ற பக்க அடி; நிமிர்ந்து, மெதுவாக, சமநிலையுடன்.']] }
      }
    },
    {
      id: 'D3', type: 'dynamic', w: { DB: 0.8, CO: 0.5, PR: 0.4, SB: 0.3 }, unit: 'reps', base: 6,
      muscles: 'Gluteus maximus/medius · Hip adductors · Quadriceps · Obliques',
      t: {
        en: { name: 'Diagonal Step', purpose: 'Diagonal weight transfer and centre-of-mass redirection outside a straight line.', adl: 'Stepping around furniture, avoiding obstacles, moving diagonally when reaching or turning.',
          levels: [['Small diagonal step', 'Hands on hips, stand tall. Small diagonal step forward, shift weight onto it, then return.'],
                   ['Diagonal step with hold', 'Step diagonally forward, hold briefly, then return. Hips level, foot flat on landing.'],
                   ['Wide diagonal step with hold', 'Take a wider diagonal step, hold, then push back slowly to start. Trunk upright.']] },
        zh: { name: '斜向迈步', purpose: '斜向重心转移，训练偏离直线的重心改向。', adl: '绕过家具、避开障碍、取物或转身时斜向移动。',
          levels: [['小斜步', '双手叉腰，站直。向斜前方迈小步，重心移至前脚后返回。'],
                   ['斜步并停顿', '向斜前方迈步，短暂停顿后返回。骨盆水平，落地全脚掌着地。'],
                   ['大斜步并停顿', '迈较大斜步，停顿后缓慢推回起始位。躯干挺直。']] },
        ms: { name: 'Langkah Pepenjuru', purpose: 'Pemindahan berat secara pepenjuru dan pengalihan pusat jisim di luar garisan lurus.', adl: 'Melangkah mengelilingi perabot, mengelak halangan, bergerak pepenjuru ketika mencapai atau berpusing.',
          levels: [['Langkah pepenjuru kecil', 'Tangan di pinggang, berdiri tegak. Langkah kecil pepenjuru ke hadapan, pindahkan berat, kemudian kembali.'],
                   ['Langkah pepenjuru dengan tahan', 'Langkah pepenjuru, tahan seketika, kemudian kembali. Pinggul rata, kaki rata semasa mendarat.'],
                   ['Langkah pepenjuru lebar dengan tahan', 'Langkah pepenjuru lebih lebar, tahan, kemudian tolak perlahan ke kedudukan asal.']] },
        ta: { name: 'மூலைவிட்ட அடி', purpose: 'நேர்கோட்டுக்கு வெளியே மூலைவிட்ட எடை மாற்றம் மற்றும் எடை மையத் திசை மாற்றம்.', adl: 'தளவாடங்களைச் சுற்றி நடத்தல், தடைகளைத் தவிர்த்தல், எட்டும்போது அல்லது திரும்பும்போது மூலைவிட்டமாக நகர்தல்.',
          levels: [['சிறிய மூலைவிட்ட அடி', 'கைகள் இடுப்பில். சிறிய மூலைவிட்ட அடி முன்னால் வைத்து எடையை மாற்றி, திரும்பவும்.'],
                   ['மூலைவிட்ட அடி + நிறுத்தம்', 'மூலைவிட்டமாக அடி வைத்து சற்று நிறுத்தி, திரும்பவும். இடுப்பு சமமாக.'],
                   ['அகன்ற மூலைவிட்ட அடி + நிறுத்தம்', 'அகன்ற மூலைவிட்ட அடி வைத்து நிறுத்தி, மெதுவாகத் தொடக்க நிலைக்குத் திரும்பவும்.']] }
      }
    },
    {
      id: 'D4', type: 'dynamic', w: { CO: 1.0, DB: 0.8, PR: 0.5, SB: 0.2 }, unit: 'reps', base: 4,
      muscles: 'Quadriceps · Gluteus maximus/medius · Gastrocnemius–soleus · Core',
      t: {
        en: { name: 'Square Stepping Exercise', purpose: 'Planned multidirectional stepping and sequencing — directly transfers to the Four Square Step Test.', adl: 'Changing direction around tables, bathroom spaces, doorways and crowded areas.',
          levels: [['Front step with hold', 'Hands on hips, imagine a square on the floor. Step forward into the next square and hold; whole foot down before returning.'],
                   ['Front then side step', 'Step forward, then sideways into the next square, then return. Finish each step before the next.'],
                   ['Front–side–back–side circuit', 'Step front, side, back, then side to return. Keep the square smooth; pause briefly at each corner.']] },
        zh: { name: '方格踏步练习', purpose: '有计划的多方向踏步与动作排序——直接迁移至四方格踏步测试。', adl: '在餐桌、浴室、门口及人多处转换方向。',
          levels: [['向前一步并停顿', '双手叉腰，想象地上有方格。向前踏入下一格并停顿，全脚掌落地后再返回。'],
                   ['前步再侧步', '先向前踏步，再向侧踏入下一格，然后返回。完成一步再做下一步。'],
                   ['前-侧-后-侧循环', '依次向前、侧、后、侧踏回原位。保持方格动作流畅，每角稍作停顿。']] },
        ms: { name: 'Latihan Langkah Petak', purpose: 'Langkah pelbagai arah terancang dan penjujukan — dipindahkan terus kepada Ujian Langkah Empat Petak.', adl: 'Menukar arah di sekeliling meja, bilik air, pintu dan kawasan sesak.',
          levels: [['Langkah depan dengan tahan', 'Tangan di pinggang, bayangkan petak di lantai. Langkah ke petak hadapan dan tahan; seluruh kaki di lantai sebelum kembali.'],
                   ['Langkah depan kemudian sisi', 'Langkah ke hadapan, kemudian ke sisi ke petak seterusnya, kemudian kembali.'],
                   ['Litar depan–sisi–belakang–sisi', 'Langkah depan, sisi, belakang, kemudian sisi untuk kembali. Berhenti seketika di setiap sudut.']] },
        ta: { name: 'சதுர அடி வைப்புப் பயிற்சி', purpose: 'திட்டமிட்ட பல்திசை அடி வைப்பு மற்றும் வரிசைப்படுத்தல் — நான்கு சதுர அடி சோதனைக்கு நேரடியாகப் பொருந்தும்.', adl: 'மேசைகள், குளியலறை, வாசல்கள், கூட்டமான இடங்களில் திசை மாற்றுதல்.',
          levels: [['முன் அடி + நிறுத்தம்', 'கைகள் இடுப்பில், தரையில் சதுரத்தைக் கற்பனை செய்யவும். அடுத்த சதுரத்துக்கு முன்னால் அடி வைத்து நிறுத்தவும்.'],
                   ['முன் அடி பின் பக்க அடி', 'முன்னால், பின் பக்கவாட்டில் அடுத்த சதுரத்துக்கு அடி வைத்து, திரும்பவும்.'],
                   ['முன்–பக்கம்–பின்–பக்கம் சுற்று', 'முன், பக்கம், பின், பக்கம் என அடி வைத்துத் தொடக்கத்துக்குத் திரும்பவும். ஒவ்வொரு மூலையிலும் சற்று நிறுத்தவும்.']] }
      }
    },
    {
      id: 'D5', type: 'dynamic', w: { PR: 0.9, DB: 0.7, CO: 0.4, SB: 0.3 }, unit: 'passes', base: 3,
      muscles: 'Gluteus maximus · Hamstrings · Tibialis anterior · Intrinsic foot muscles',
      t: {
        en: { name: 'Backward Walk', purpose: 'Posterior stepping without visual foot placement — high proprioceptive and vestibular demand.', adl: 'Stepping back from counters, doors, lifts or people; recovering from backward balance loss.',
          levels: [['Small gap between feet', 'Hands on hips, stand tall, look forward. Walk backward with a small gap between the feet; feel each step.'],
                   ['Backward heel-to-toe', 'Place one foot directly behind the other. Keep steps narrow, slow and controlled.'],
                   ['Backward heel-to-toe + arm circles', 'Walk backward heel-to-toe while making slow arm circles; trunk tall, feet unhurried.']] },
        zh: { name: '向后步行', purpose: '在看不到落脚点的情况下向后迈步——对本体感觉和前庭功能要求高。', adl: '从台面、门口、电梯或他人处后退；向后失衡时的恢复。',
          levels: [['双脚间留小间隙', '双手叉腰，站直、目视前方。双脚留小间隙向后走，感受每一步。'],
                   ['向后脚尖贴脚跟', '一脚放在另一脚正后方。步伐窄、慢、受控。'],
                   ['向后一字步＋手臂画圈', '向后一字步行的同时缓慢画手臂圆圈；躯干挺直，脚步不急。']] },
        ms: { name: 'Jalan Mengundur', purpose: 'Melangkah ke belakang tanpa melihat kaki — tuntutan propriosepsi dan vestibular yang tinggi.', adl: 'Berundur dari kaunter, pintu, lif atau orang; pulih daripada hilang keseimbangan ke belakang.',
          levels: [['Jarak kecil antara kaki', 'Tangan di pinggang, berdiri tegak, pandang ke hadapan. Jalan mengundur dengan jarak kecil antara kaki; rasai setiap langkah.'],
                   ['Mengundur jari-ke-tumit', 'Letakkan satu kaki betul-betul di belakang kaki yang lain. Langkah sempit, perlahan dan terkawal.'],
                   ['Mengundur tandem + bulatan lengan', 'Jalan mengundur tandem sambil membuat bulatan lengan perlahan; badan tegak.']] },
        ta: { name: 'பின்னோக்கி நடை', purpose: 'கால் வைப்பைப் பார்க்காமல் பின்னோக்கி அடி வைத்தல் — உடல் நிலை உணர்வு மற்றும் உள்செவிச் சமநிலைக்கு அதிகத் தேவை.', adl: 'மேசை, கதவு, மின்தூக்கி அல்லது மக்களிடமிருந்து பின்வாங்குதல்; பின்னோக்கிச் சமநிலை இழப்பிலிருந்து மீளுதல்.',
          levels: [['கால்களுக்கு இடையே சிறு இடைவெளி', 'கைகள் இடுப்பில், முன்னால் பார்த்தபடி சிறு இடைவெளியுடன் பின்னோக்கி நடக்கவும்; ஒவ்வொரு அடியையும் உணரவும்.'],
                   ['பின்னோக்கி குதிகால்-விரல்', 'ஒரு காலை மற்றொன்றின் நேர் பின்னால் வைக்கவும். அடிகள் குறுகியதாக, மெதுவாக.'],
                   ['பின்னோக்கி வரிசை நடை + கை வட்டங்கள்', 'பின்னோக்கி வரிசையாக நடந்தபடி மெதுவாகக் கை வட்டங்கள் செய்யவும்.']] }
      }
    },
    {
      id: 'D6', type: 'dynamic', w: { DB: 0.7, PR: 0.7, CO: 0.5, SB: 0.3 }, unit: 'reps', base: 8,
      muscles: 'Iliopsoas · Rectus femoris · Tibialis anterior · Gluteus medius',
      t: {
        en: { name: 'Imaginary Hurdle Step-Over Walk', purpose: 'Foot clearance, hip/knee lift and controlled landing — obstacle negotiation without equipment.', adl: 'Stepping over thresholds, rugs, cables, drains, kerbs and low household obstacles.',
          levels: [['Foot-level hurdle', 'Hands on hips, imagine a low line at foot level. Lift one foot over and step through; clear the toes, land softly.'],
                   ['Mid-shin hurdle', 'Imagine a hurdle at mid-shin height. Lift the knee higher and step over; control the landing.'],
                   ['Knee-level hurdle', 'Imagine a hurdle near knee height. Lift the knee, step over, place the foot down slowly.']] },
        zh: { name: '假想跨栏步行', purpose: '训练足部离地高度、髋膝抬举及受控落地——无需器材的障碍跨越。', adl: '跨过门槛、地毯、电线、排水沟、路缘及家中低矮障碍物。',
          levels: [['脚踝高度假想栏', '双手叉腰，想象脚边有一条低线。抬脚跨过，脚尖离地，轻柔落地。'],
                   ['小腿中段高度假想栏', '想象小腿中段高的栏。抬膝更高跨过，控制落地。'],
                   ['膝盖高度假想栏', '想象接近膝盖高的栏。抬膝跨过，缓慢放下脚。']] },
        ms: { name: 'Jalan Melangkah Halangan Khayalan', purpose: 'Kelegaan kaki, angkatan pinggul/lutut dan pendaratan terkawal — melepasi halangan tanpa peralatan.', adl: 'Melangkah melepasi bendul pintu, permaidani, kabel, longkang, bahu jalan dan halangan rendah di rumah.',
          levels: [['Halangan paras kaki', 'Tangan di pinggang, bayangkan garisan rendah paras kaki. Angkat kaki dan langkah melepasi; mendarat perlahan.'],
                   ['Halangan paras tengah betis', 'Bayangkan halangan paras tengah betis. Angkat lutut lebih tinggi dan langkah melepasi.'],
                   ['Halangan paras lutut', 'Bayangkan halangan hampir paras lutut. Angkat lutut, langkah melepasi, letak kaki perlahan.']] },
        ta: { name: 'கற்பனைத் தடை தாண்டும் நடை', purpose: 'கால் உயர்த்தல், இடுப்பு/முழங்கால் தூக்குதல், கட்டுப்பாடான தரையிறக்கம் — உபகரணமின்றித் தடை கடத்தல்.', adl: 'வாசற்படி, விரிப்பு, கம்பிகள், வடிகால், நடைபாதை விளிம்பு, வீட்டுத் தடைகளைத் தாண்டுதல்.',
          levels: [['பாத உயரத் தடை', 'கைகள் இடுப்பில், பாத உயரத்தில் தாழ்வான கோட்டைக் கற்பனை செய்யவும். காலைத் தூக்கித் தாண்டி மெதுவாக இறக்கவும்.'],
                   ['கணுக்கால்-முழங்கால் நடுவுயரத் தடை', 'முழங்காலை உயரமாகத் தூக்கித் தாண்டவும்; தரையிறக்கத்தைக் கட்டுப்படுத்தவும்.'],
                   ['முழங்கால் உயரத் தடை', 'முழங்கால் உயரத் தடையைக் கற்பனை செய்து தாண்டி, காலை மெதுவாக வைக்கவும்.']] }
      }
    },
    {
      id: 'D7', type: 'dynamic', w: { CO: 0.8, DB: 0.8, PR: 0.4, SB: 0.2 }, unit: 'passes', base: 3,
      muscles: 'Gluteus medius/minimus · Hip adductors/rotators · Obliques · Quadriceps',
      t: {
        en: { name: 'Zig-Zag Diagonal Walk', purpose: 'Continuous diagonal direction change, anticipatory postural adjustments and gait adaptability.', adl: 'Weaving around people, furniture, pets and objects while walking.',
          levels: [['Narrow zig-zag', 'Hands on hips, imagine a straight line. Step slightly diagonal left, then diagonal right; small steps, toes forward.'],
                   ['Wider zig-zag with hold', 'Step wider to the left diagonal, hold briefly, then to the right diagonal. Control the body before changing direction.'],
                   ['Continuous wide zig-zag', 'Walk in wider left–right diagonals smoothly. Turn with the feet, not by twisting the knees.']] },
        zh: { name: '之字形斜向步行', purpose: '连续斜向转换方向，训练预期性姿势调整与步态适应能力。', adl: '步行时绕过行人、家具、宠物和物品。',
          levels: [['窄幅之字步', '双手叉腰，想象一条直线。向左斜前小步，再向右斜前小步，脚尖朝前。'],
                   ['较宽之字步并停顿', '向左斜方迈较宽步，短暂停顿，再向右斜方。转向前先控制身体。'],
                   ['连续宽幅之字步', '流畅地连续左右斜向行走。用脚转向，不要扭膝。']] },
        ms: { name: 'Jalan Pepenjuru Zig-Zag', purpose: 'Perubahan arah pepenjuru berterusan, pelarasan postur antisipasi dan kebolehsuaian gaya berjalan.', adl: 'Mengelak orang, perabot, haiwan peliharaan dan objek semasa berjalan.',
          levels: [['Zig-zag sempit', 'Tangan di pinggang, bayangkan garisan lurus. Langkah sedikit pepenjuru kiri, kemudian kanan; langkah kecil.'],
                   ['Zig-zag lebih lebar dengan tahan', 'Langkah lebih lebar ke pepenjuru kiri, tahan seketika, kemudian ke kanan. Kawal badan sebelum menukar arah.'],
                   ['Zig-zag lebar berterusan', 'Berjalan dalam pepenjuru kiri–kanan yang lebih lebar dengan lancar. Pusing dengan kaki, bukan memulas lutut.']] },
        ta: { name: 'வளைந்து நெளிந்த மூலைவிட்ட நடை', purpose: 'தொடர்ச்சியான மூலைவிட்டத் திசை மாற்றம், முன்கூட்டிய உடல்நிலைச் சரிசெய்தல், நடைத் தகவமைப்பு.', adl: 'நடக்கும்போது மக்கள், தளவாடங்கள், செல்லப்பிராணிகள், பொருட்களைச் சுற்றி நகர்தல்.',
          levels: [['குறுகிய வளைவு நடை', 'கைகள் இடுப்பில், நேர்கோட்டைக் கற்பனை செய்யவும். சற்று இடது-மூலைவிட்டம், பின் வலது-மூலைவிட்டம் அடி வைக்கவும்.'],
                   ['அகன்ற வளைவு + நிறுத்தம்', 'இடது மூலைவிட்டத்துக்கு அகலமாக அடி வைத்து நிறுத்தி, பின் வலது பக்கம். திசை மாற்றும் முன் உடலைக் கட்டுப்படுத்தவும்.'],
                   ['தொடர்ச்சியான அகன்ற வளைவு நடை', 'இடம்-வலம் மூலைவிட்டங்களில் சீராக நடக்கவும். முழங்காலை முறுக்காமல் கால்களால் திரும்பவும்.']] }
      }
    },
    {
      id: 'D8', type: 'dynamic', w: { CO: 1.0, DB: 0.7, PR: 0.4, SB: 0.1 }, unit: 'passes', base: 2, advanced: true,
      muscles: 'Hip abductors/adductors · Hip rotators · Obliques · Gluteus maximus',
      t: {
        en: { name: 'Carioca Variations', purpose: 'Advanced lateral coordination: cross-step sequencing, trunk–pelvis dissociation and rhythm.', adl: 'Advanced lateral agility for turning and navigating tight or crowded spaces.',
          levels: [['Side step with behind-cross', 'Hands on hips, step to the side, cross the other foot behind, side step again. Chest faces forward; move slowly.'],
                   ['Front-and-behind cross step', 'Side step, cross in front, side step, cross behind. Keep it slow; do not twist the knees.'],
                   ['Continuous carioca', 'Move sideways with front-and-behind cross steps. Smooth rhythm, trunk tall; control each cross step.']] },
        zh: { name: '交叉步变式（Carioca）', purpose: '高级侧向协调：交叉步序列、躯干与骨盆分离及节奏控制。', adl: '在狭窄或拥挤空间中转身和穿行的高级侧向灵活性。',
          levels: [['侧步＋后交叉', '双手叉腰，向侧迈步，另一脚从后方交叉，再侧步。胸部朝前，慢速进行。'],
                   ['前后交叉步', '侧步、前交叉、侧步、后交叉。保持慢速，不扭膝。'],
                   ['连续交叉步', '以前后交叉步连续横向移动。节奏流畅，躯干挺直，控制每一个交叉步。']] },
        ms: { name: 'Variasi Carioca', purpose: 'Koordinasi sisi lanjutan: penjujukan langkah silang, pemisahan badan–pelvis dan irama.', adl: 'Ketangkasan sisi lanjutan untuk berpusing dan bergerak di ruang sempit atau sesak.',
          levels: [['Langkah sisi dengan silang belakang', 'Tangan di pinggang, langkah ke sisi, silangkan kaki lain di belakang, langkah sisi lagi. Dada menghadap ke hadapan.'],
                   ['Langkah silang depan dan belakang', 'Langkah sisi, silang depan, langkah sisi, silang belakang. Perlahan; jangan pulas lutut.'],
                   ['Carioca berterusan', 'Bergerak ke sisi dengan langkah silang depan dan belakang. Irama lancar, badan tegak.']] },
        ta: { name: 'கரியோகா மாறுபாடுகள்', purpose: 'மேம்பட்ட பக்கவாட்டு ஒருங்கிணைப்பு: குறுக்கு அடி வரிசை, உடல்–இடுப்பு பிரிப்பு, தாளம்.', adl: 'குறுகிய அல்லது கூட்டமான இடங்களில் திரும்புவதற்கும் நகர்வதற்கும் மேம்பட்ட பக்கவாட்டுச் சுறுசுறுப்பு.',
          levels: [['பக்க அடி + பின்புறக் குறுக்கு', 'கைகள் இடுப்பில், பக்கவாட்டில் அடி வைத்து, மற்ற காலைப் பின்புறமாகக் குறுக்கே வைத்து, மீண்டும் பக்க அடி.'],
                   ['முன்-பின் குறுக்கு அடி', 'பக்க அடி, முன்புறக் குறுக்கு, பக்க அடி, பின்புறக் குறுக்கு. மெதுவாக; முழங்காலை முறுக்காதீர்கள்.'],
                   ['தொடர்ச்சியான கரியோகா', 'முன்-பின் குறுக்கு அடிகளுடன் பக்கவாட்டில் நகரவும். சீரான தாளம், நிமிர்ந்த உடல்.']] }
      }
    }
  ];

  FS.exById = id => FS.EXERCISES.find(e => e.id === id);
})(typeof window !== 'undefined' ? window : globalThis);
