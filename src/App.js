import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus,
  Trash2,
  GraduationCap,
  Loader2,
  CheckCircle2,
  Layout,
  ListTodo,
  X,
  PieChart,
  Target,
  AlertCircle,
  Clock,
  LogOut,
  Settings,
  BookOpen,
  ChevronRight,
  Star,
  Award,
  Boxes,
  LayoutDashboard,
  Wifi,
  WifiOff,
  Undo2,
  ChevronDown,
} from "lucide-react";
// 引入 framer-motion 实现原生级动画
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInAnonymously,
  signInWithCustomToken,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  updateDoc,
  enableIndexedDbPersistence,
} from "firebase/firestore";

// =================================================================
// 🔴 部署配置
// =================================================================
const USER_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAonGPelzYJXvgCwu7_X-M0hKnwNGydZRE",
  authDomain: "my-degree-planner.firebaseapp.com",
  projectId: "my-degree-planner",
  storageBucket: "my-degree-planner.firebasestorage.app",
  messagingSenderId: "61543774322",
  appId: "1:61543774322:web:5f41f4c7652cc140236aeb",
  measurementId: "G-SHGEBF4DMW",
};

// =================================================================
// 🚀 系统初始化
// =================================================================
let app, auth, db;
let configStatus = "pending";

try {
  if (typeof __firebase_config !== "undefined" && __firebase_config) {
    if (!getApps().length) app = initializeApp(JSON.parse(__firebase_config));
    else app = getApp();
    configStatus = "canvas";
  } else if (USER_FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY_HERE") {
    if (!getApps().length) app = initializeApp(USER_FIREBASE_CONFIG);
    else app = getApp();
    configStatus = "valid";
  } else {
    configStatus = "invalid";
  }

  if (configStatus === "valid" || configStatus === "canvas") {
    auth = getAuth(app);
    db = getFirestore(app);
    try {
      enableIndexedDbPersistence(db).catch(() => {});
    } catch (e) {}
  }
} catch (e) {
  console.error("Init Error:", e);
  configStatus = "invalid";
}

const googleProvider = new GoogleAuthProvider();

// =================================================================
// 📚 数据常量
// =================================================================
const CURRICULUM_DATA = {
  1: [
    { name: "中国近现代史纲要", credits: 3, category: "通识必修" },
    { name: "计算思维", credits: 3, category: "通识必修" },
    { name: "大学英语(1)", credits: 2, category: "通识必修" },
    { name: "体育(1)", credits: 1, category: "通识必修" },
    { name: "军事理论", credits: 2, category: "通识必修" },
    { name: "形势与政策(1)", credits: 0, category: "通识必修" },
    { name: "高等数学(1)", credits: 4, category: "学科基础" },
    { name: "管理学原理", credits: 3, category: "学科基础" },
    { name: "国家安全教育", credits: 2, category: "重点提升" },
    { name: "大学生心理健康教育", credits: 2, category: "重点提升" },
    { name: "军事技能", credits: 2, category: "重点提升" },
    { name: "新生研讨课", credits: 1, category: "专业必修" },
  ],
  2: [
    { name: "思想道德与法治", credits: 3, category: "通识必修" },
    { name: "体育(2)", credits: 1, category: "通识必修" },
    { name: "形势与政策(2)", credits: 0.5, category: "通识必修" },
    { name: "“大思政”社会实践(1)", credits: 1, category: "重点提升" },
    { name: "四史教育系列专题", credits: 1, category: "重点提升" },
    { name: "生涯发展:学业职业目标", credits: 1, category: "重点提升" },
    { name: "高等数学(2)", credits: 4, category: "学科基础" },
    { name: "线性代数", credits: 4, category: "学科基础" },
    { name: "经济学原理", credits: 4, category: "学科基础" },
    { name: "会计学原理", credits: 3, category: "学科基础" },
    { name: "大学英语(2)", credits: 2, category: "通识必修" },
  ],
  3: [
    { name: "马克思主义基本原理", credits: 3, category: "通识必修" },
    { name: "体育(3)", credits: 1, category: "通识必修" },
    { name: "形势与政策(3)", credits: 0, category: "通识必修" },
    { name: "英语演讲与辩论", credits: 2, category: "通识必修" }, // 已修改
    { name: "程序设计", credits: 3, category: "学科基础" },
    { name: "概率论与数理统计", credits: 4, category: "学科基础" },
    { name: "运筹学(1)", credits: 3, category: "学科基础" },
    { name: "数据库系统原理与应用", credits: 2, category: "学科基础" },
    { name: "电子商务", credits: 2.5, category: "专业必修" },
    { name: "供应链管理概论", credits: 2, category: "专业必修" },
  ],
  4: [
    { name: "体育(4)", credits: 1, category: "通识必修" },
    { name: "形势与政策(4)", credits: 0.5, category: "通识必修" },
    { name: "中华优秀传统文化英文解读", credits: 2, category: "通识必修" }, // 已修改
    { name: "“大思政”社会实践(2)", credits: 0.5, category: "重点提升" },
    { name: "系统工程", credits: 3, category: "学科基础" },
    { name: "统计学", credits: 2, category: "学科基础" },
    { name: "运筹学(2)", credits: 2, category: "学科基础" },
    { name: "认知实习", credits: 1, category: "专业必修" },
    { name: "Python程序设计", credits: 2, category: "专业必修" },
    { name: "物流管理", credits: 2, category: "专业必修" },
    { name: "运营管理(双语)", credits: 2, category: "专业必修" },
    { name: "计量经济学", credits: 2, category: "专业必修" },
    { name: "库存管理与控制", credits: 2, category: "专业必修" },
  ],
  5: [
    { name: "习近平新时代中国特色...", credits: 3, category: "通识必修" },
    { name: "毛泽东思想...", credits: 3, category: "通识必修" },
    { name: "形势与政策(5)", credits: 0, category: "通识必修" },
    { name: "管理研究方法", credits: 2, category: "学科基础" },
    { name: "管理信息系统", credits: 3, category: "专业必修" },
    { name: "ERP供应链综合实验", credits: 1, category: "专业必修" },
    { name: "管理决策分析", credits: 2, category: "专业必修" },
    { name: "组织与战略管理", credits: 2, category: "专业必修" },
    { name: "供应链金融", credits: 2, category: "专业必修" },
    { name: "供应链系统规划与设计", credits: 3, category: "专业必修" },
    { name: "供应链建模与仿真", credits: 3, category: "专业必修" },
    { name: "供应链资源规划", credits: 2, category: "专业必修" },
  ],
  6: [
    { name: "形势与政策(6)", credits: 0.5, category: "通识必修" },
    { name: "“大思政”社会实践(3)", credits: 0.5, category: "重点提升" },
    { name: "企业经营模拟", credits: 1, category: "专业必修" },
    { name: "大数据管理与分析实验", credits: 1, category: "专业必修" },
    { name: "数据科学与大数据分析", credits: 2, category: "专业必修" },
  ],
  7: [
    { name: "形势与政策(7)", credits: 0, category: "通识必修" },
    { name: "劳动教育", credits: 2, category: "重点提升" },
    {
      name: "（建议）专业选修课",
      credits: 0,
      category: "专业选修",
      isPlaceholder: true,
    },
  ],
  8: [
    { name: "形势与政策(8)", credits: 0.5, category: "通识必修" },
    { name: "毕业实习", credits: 4, category: "专业必修" },
    { name: "毕业论文(设计)", credits: 6, category: "专业必修" },
  ],
};

const GE_CORE_MODULES = {
  "通核-人文素养": {
    required: 2,
    color: "bg-pink-500",
    shadow: "shadow-pink-200",
  },
  "通核-艺术审美": {
    required: 2,
    color: "bg-rose-500",
    shadow: "shadow-rose-200",
  },
  "通核-科技素养": {
    required: 2,
    color: "bg-fuchsia-500",
    shadow: "shadow-fuchsia-200",
  },
  "通核-生命健康": {
    required: 2,
    color: "bg-purple-500",
    shadow: "shadow-purple-200",
  },
};

const EXTENSION_MODULES = {
  "拓展-学术创新": {
    required: 1,
    color: "bg-amber-500",
    shadow: "shadow-amber-200",
  },
  "拓展-文化艺术": {
    required: 1,
    color: "bg-orange-500",
    shadow: "shadow-orange-200",
  },
  "拓展-社会服务": {
    required: 1,
    color: "bg-yellow-600",
    shadow: "shadow-yellow-200",
  },
  "拓展-身心健康": {
    required: 1,
    color: "bg-yellow-500",
    shadow: "shadow-yellow-200",
  },
};

const INNOVATION_MODULES = {
  "创新-稷下创新": {
    required: 2,
    color: "bg-cyan-500",
    shadow: "shadow-cyan-200",
  },
  "创业-齐鲁创业": {
    required: 2,
    color: "bg-sky-500",
    shadow: "shadow-sky-200",
  },
};

const BASE_REQUIREMENTS = {
  通识必修: { required: 34, color: "bg-blue-600" },
  学科基础: { required: 43, color: "bg-indigo-600" },
  专业必修: { required: 48.5, color: "bg-violet-600" },
  专业选修: { required: 10, color: "bg-slate-700" },
  重点提升: { required: 12, color: "bg-emerald-600" },
  通识选修: { required: 4, color: "bg-gray-500" },
};

const ALL_STATS_CONFIG = {
  ...BASE_REQUIREMENTS,
  ...GE_CORE_MODULES,
  ...EXTENSION_MODULES,
  ...INNOVATION_MODULES,
};

const PRESET_ELECTIVES = [
  "数据结构",
  "工程经济学",
  "供应链成本与绩效管理",
  "客户关系管理",
  "可持续供应链管理",
  "国际物流与供应链管理",
  "供应链管理前沿(双语)",
  "网络营销(双语)",
  "财务管理学",
  "项目管理",
  "服务管理",
  "云计算与物联网",
  "质量管理与可靠性工程",
  "产品技术管理",
  "市场营销学",
];

const DROPDOWN_GROUPS = [
  {
    group: "核心课程",
    options: [
      { label: "专业选修课 (通用)", value: "专业选修", parent: "专业选修" },
      ...PRESET_ELECTIVES.map((c) => ({
        label: `[专选] ${c}`,
        value: "专业选修",
        presetName: c,
      })),
      { label: "通识选修课", value: "通识选修", parent: "通识选修" },
      { label: "重点提升计划", value: "重点提升", parent: "重点提升" },
    ],
  },
  {
    group: "通识核心 (各模块修2学分)",
    options: Object.keys(GE_CORE_MODULES).map((k) => ({ label: k, value: k })),
  },
  {
    group: "拓展培养 (各模块修1学分)",
    options: Object.keys(EXTENSION_MODULES).map((k) => ({
      label: k,
      value: k,
    })),
  },
  {
    group: "创新创业 (共4学分)",
    options: Object.keys(INNOVATION_MODULES).map((k) => ({
      label: k,
      value: k,
    })),
  },
];

// =================================================================
// 🎨 组件：骨架屏
// =================================================================
const SkeletonCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="bg-white rounded-3xl p-5 border border-slate-100 relative overflow-hidden h-32"
  >
    <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-slate-50/80 to-transparent -translate-x-full z-10"></div>
    <div className="h-4 w-1/3 bg-slate-100 rounded-full mb-4"></div>
    <div className="h-2 w-full bg-slate-100 rounded-full mb-2"></div>
    <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
  </motion.div>
);

// =================================================================
// 🎨 主应用
// =================================================================
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("plan");
  const [planProgress, setPlanProgress] = useState({});
  const [electives, setElectives] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [electiveForm, setElectiveForm] = useState({
    name: "",
    credits: "",
    category: "专业选修",
  });
  const [loginError, setLoginError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Scroll logic
  const topRef = useRef(null);

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes shimmer { 100% { transform: translateX(100%); } }
      .animate-shimmer { animation: shimmer 1.5s infinite; }
      
      /* Mobile Optimizations */
      html, body {
        overscroll-behavior-y: none; /* Prevent bounce effect on body */
        -webkit-tap-highlight-color: transparent;
      }
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      
      /* Safe Area Utilities */
      .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
      .pt-safe { padding-top: env(safe-area-inset-top); }
      .min-h-safe { min-height: 100dvh; } /* Fallback handled by tailwind usually, but explicit here helps */
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
    };
  }, []);

  // --- Auth & Data Loading ---
  useEffect(() => {
    if (configStatus === "invalid") {
      setAuthLoading(false);
      setLoading(false);
      return;
    }
    const initAuth = async () => {
      if (configStatus === "canvas") {
        try {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          ) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {}
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setLoading(false);
        setPlanProgress({});
        setElectives([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setLoginError(null);
    try {
      if (configStatus === "canvas") {
        alert("Canvas 环境已自动登录。");
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoginError(`登录失败: ${error.message}`);
    }
  };

  const handleGuestLogin = () => {
    setUser({ uid: "guest_user", displayName: "访客模式", isAnonymous: true });
    setAuthLoading(false);
  };

  // --- Local Cache ---
  const loadFromCache = (uid, key) => {
    try {
      const cached = localStorage.getItem(`cache_v3_${uid}_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  };
  const saveToCache = (uid, key, data) => {
    try {
      if (data)
        localStorage.setItem(`cache_v3_${uid}_${key}`, JSON.stringify(data));
    } catch (e) {}
  };

  useEffect(() => {
    if (!user || configStatus === "invalid") return;
    setLoading(true);

    const appId =
      configStatus === "canvas"
        ? typeof __app_id !== "undefined"
          ? __app_id
          : "default"
        : "deployed";

    const cachedPlan = loadFromCache(user.uid, "planProgress");
    const cachedElec = loadFromCache(user.uid, "electives");
    if (cachedPlan) setPlanProgress(cachedPlan);
    if (cachedElec) setElectives(cachedElec);
    if (cachedPlan || cachedElec) setLoading(false);

    const planRef =
      configStatus === "canvas"
        ? doc(
            db,
            "artifacts",
            appId,
            "users",
            user.uid,
            "data",
            "plan_progress_v3"
          )
        : doc(db, "users", user.uid, "data", "plan_progress_v3");

    const electivesRef =
      configStatus === "canvas"
        ? collection(db, "artifacts", appId, "users", user.uid, "electives_v3")
        : collection(db, "users", user.uid, "electives_v3");

    const unsubPlan = onSnapshot(planRef, async (docSnap) => {
      let data = docSnap.exists() ? docSnap.data() : {};

      // 🛠️ 自动迁移逻辑：如果检测到旧的课程名，迁移到新课程名
      let needMigration = false;
      const migrations = {
        "大学英语(3)": "英语演讲与辩论",
        "大学英语(4)": "中华优秀传统文化英文解读",
      };

      Object.keys(migrations).forEach((oldName) => {
        if (data[oldName] && !data[migrations[oldName]]) {
          data[migrations[oldName]] = data[oldName];
          delete data[oldName]; // 可选：删除旧的，或者保留
          needMigration = true;
        }
      });

      if (needMigration) {
        console.log("Migrating course data...");
        // 更新本地状态和缓存，并在后台静默更新数据库
        try {
          await setDoc(planRef, data, { merge: true });
        } catch (e) {
          console.warn("Migration sync failed", e);
        }
      }

      setPlanProgress(data);
      saveToCache(user.uid, "planProgress", data);
      setLoading(false);
    });

    const unsubElec = onSnapshot(query(electivesRef), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setElectives(data);
      saveToCache(user.uid, "electives", data);
      setLoading(false);
    });

    return () => {
      unsubPlan();
      unsubElec();
    };
  }, [user]);

  const getDBPath = () => {
    const isCanvas = configStatus === "canvas";
    const appId = typeof __app_id !== "undefined" ? __app_id : "default";
    return {
      planDoc: isCanvas
        ? doc(
            db,
            "artifacts",
            appId,
            "users",
            user.uid,
            "data",
            "plan_progress_v3"
          )
        : doc(db, "users", user.uid, "data", "plan_progress_v3"),
      elecCol: isCanvas
        ? collection(db, "artifacts", appId, "users", user.uid, "electives_v3")
        : collection(db, "users", user.uid, "electives_v3"),
      elecDoc: (id) =>
        isCanvas
          ? doc(db, "artifacts", appId, "users", user.uid, "electives_v3", id)
          : doc(db, "users", user.uid, "electives_v3", id),
    };
  };

  const handleToggleFixedCourse = async (courseName) => {
    if (!user) return;
    const { planDoc } = getDBPath();
    const current = planProgress[courseName] || {};
    const newData = { ...planProgress };

    if (!current.taken) {
      newData[courseName] = { taken: true, status: "planned", score: "" };
    } else if (current.status === "planned") {
      delete newData[courseName];
    } else if (current.status === "completed") {
      // Haptic feedback logic could go here
      if (confirm(`确定撤销“${courseName}”？`)) {
        delete newData[courseName];
      } else {
        return;
      }
    }
    setPlanProgress(newData);
    saveToCache(user.uid, "planProgress", newData);
    try {
      await setDoc(planDoc, newData);
    } catch (e) {}
  };

  const handleUpdateFixedScore = async (courseName, score) => {
    if (!user) return;
    const { planDoc } = getDBPath();
    const newData = {
      ...planProgress,
      [courseName]: {
        ...planProgress[courseName],
        score,
        status: score ? "completed" : "planned",
      },
    };
    setPlanProgress(newData);
    saveToCache(user.uid, "planProgress", newData);
    await setDoc(planDoc, newData);
  };

  const handleAddElective = async (status) => {
    if (!user || !electiveForm.name || !electiveForm.credits) return;
    const { elecCol } = getDBPath();
    await setDoc(doc(elecCol), {
      name: electiveForm.name,
      credits: parseFloat(electiveForm.credits),
      category: electiveForm.category,
      subCategory: electiveForm.category,
      status: status,
      passed: status === "completed",
      createdAt: serverTimestamp(),
    });
    setElectiveForm({ ...electiveForm, name: "", credits: "" });
  };

  const handleDeleteElective = async (id) => {
    if (confirm("确定删除？")) {
      const { elecDoc } = getDBPath();
      await deleteDoc(elecDoc(id));
    }
  };

  const handleToggleElectiveStatus = async (item) => {
    const { elecDoc } = getDBPath();
    const newStatus = item.status === "planned" ? "completed" : "planned";
    await updateDoc(elecDoc(item.id), { status: newStatus });
  };

  const handlePresetSelect = (e) => {
    const selectedIndex = e.target.selectedIndex;
    const option = e.target.options[selectedIndex];
    if (option.text.startsWith("[专选]")) {
      setElectiveForm({
        ...electiveForm,
        category: e.target.value,
        name: option.text.replace("[专选] ", ""),
      });
    } else {
      setElectiveForm({ ...electiveForm, category: e.target.value });
    }
  };

  const stats = useMemo(() => {
    const breakdown = {};
    Object.keys(ALL_STATS_CONFIG).forEach((key) => {
      breakdown[key] = {
        earned: 0,
        planned: 0,
        required: ALL_STATS_CONFIG[key].required,
      };
    });
    let totalEarned = 0,
      totalPlanned = 0,
      totalScore = 0,
      gpaCredits = 0;
    Object.keys(CURRICULUM_DATA).forEach((sem) => {
      CURRICULUM_DATA[sem].forEach((course) => {
        if (course.isPlaceholder) return;
        const record = planProgress[course.name];
        if (record && record.taken) {
          const cat = course.category;
          if (breakdown[cat]) {
            if (record.status === "completed") {
              breakdown[cat].earned += course.credits;
              totalEarned += course.credits;
              const s = parseFloat(record.score);
              if (!isNaN(s)) {
                totalScore += s * course.credits;
                gpaCredits += course.credits;
              }
            } else {
              breakdown[cat].planned += course.credits;
              totalPlanned += course.credits;
            }
          }
        }
      });
    });
    electives.forEach((el) => {
      const catKey = el.category || el.subCategory;
      if (breakdown[catKey]) {
        if (el.status === "completed") {
          breakdown[catKey].earned += el.credits;
          totalEarned += el.credits;
        } else {
          breakdown[catKey].planned += el.credits;
          totalPlanned += el.credits;
        }
      }
    });
    const gpa = gpaCredits > 0 ? (totalScore / gpaCredits).toFixed(2) : "0.00";
    return { breakdown, totalEarned, totalPlanned, gpa, totalRequired: 167.5 };
  }, [planProgress, electives]);

  // --- Render ---

  if (authLoading)
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-slate-50">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="relative w-20 h-20 mb-6 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50"></div>
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative z-10">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        <span className="text-slate-400 text-sm font-medium tracking-wide">
          正在同步学业数据...
        </span>
      </div>
    );

  if (!user) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/50 p-6 font-sans overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 max-w-sm w-full text-center border border-white"
        >
          <motion.div
            whileHover={{ rotate: 10 }}
            className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-300 rotate-3"
          >
            <GraduationCap className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
            学业规划系统
          </h1>
          <p className="text-slate-500 mb-10 font-medium text-sm">
            全周期学分追踪 · 移动端优化版
          </p>

          {loginError && (
            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-2xl text-xs font-bold border border-red-100">
              <AlertCircle className="w-3 h-3 inline mr-1" />
              {loginError}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleGoogleLogin}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm mb-3 shadow-lg flex items-center justify-center"
          >
            Google 账号登录
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleGuestLogin}
            className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm"
          >
            我是访客 (直接试用)
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    // 使用 100dvh + min-h-screen 双重保障
    <div
      className="min-h-screen min-h-[100dvh] bg-[#f8fafc] text-slate-800 font-sans flex flex-col"
      ref={topRef}
    >
      {/* 顶部导航 (Sticky + Safe Area) */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-30 pt-safe">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-base tracking-tight">
              学业规划
            </span>
          </motion.div>

          <div className="flex items-center gap-3">
            {!isOnline && (
              <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 animate-pulse">
                <WifiOff className="w-3 h-3 mr-1" />
                <span className="text-[10px] font-bold">离线</span>
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => signOut(auth)}
              className="p-2 bg-slate-100 rounded-full text-slate-500"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 w-full mt-4 pb-32 md:pb-10 space-y-4 md:space-y-6">
        {/* Mobile Tab Control (iOS Style) */}
        <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 md:static md:z-0 -mx-4 px-4 pb-2 bg-[#f8fafc]/95 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:p-0">
          <div className="bg-slate-200/50 p-1 rounded-2xl flex relative h-12 shadow-inner">
            {["plan", "electives", "stats"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex-1 relative z-10 text-xs font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 ${
                    isActive ? "text-indigo-600" : "text-slate-500"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1">
                    {tab === "plan" && <Layout className="w-4 h-4" />}
                    {tab === "electives" && <ListTodo className="w-4 h-4" />}
                    {tab === "stats" && <PieChart className="w-4 h-4" />}
                    {
                      {
                        plan: "课表",
                        electives: "选修",
                        stats: "统计",
                      }[tab]
                    }
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {loading && [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}

              {!loading &&
                [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                  const semCourses = CURRICULUM_DATA[sem];
                  // 修复：如果没有课程（只有占位符），避免分母为0
                  const realCourses = semCourses.filter(
                    (c) => !c.isPlaceholder
                  );
                  const totalCount = realCourses.length || 1; // Prevent division by zero

                  const completed = semCourses.filter(
                    (c) =>
                      !c.isPlaceholder &&
                      planProgress[c.name]?.status === "completed"
                  ).length;
                  const planned = semCourses.filter(
                    (c) =>
                      !c.isPlaceholder &&
                      planProgress[c.name]?.status === "planned"
                  ).length;

                  const progress = Math.round((completed / totalCount) * 100);
                  const planWidth = Math.round(
                    ((completed + planned) / totalCount) * 100
                  );

                  return (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className={`
                        cursor-pointer bg-white rounded-3xl border p-5 relative overflow-hidden
                        ${
                          selectedSemester === sem
                            ? "ring-2 ring-indigo-500 border-indigo-500 z-10"
                            : "border-slate-100 shadow-sm"
                        }
                      `}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-700">
                            第 {sem} 学期
                          </span>
                          {realCourses.length > 0 && progress === 100 && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        {realCourses.length > 0 && (
                          <div className="flex items-center space-x-1 text-xs font-bold bg-slate-50 px-2 py-1 rounded-lg">
                            <span className="text-indigo-600">{completed}</span>
                            <span className="text-slate-300">
                              / {realCourses.length}
                            </span>
                          </div>
                        )}
                        {realCourses.length === 0 && (
                          <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-1 rounded-lg font-medium">
                            无必修
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-slate-100 h-2.5 rounded-full mb-5 overflow-hidden relative">
                        {realCourses.length > 0 && (
                          <>
                            <motion.div
                              className="absolute left-0 top-0 h-full bg-amber-300"
                              initial={{ width: 0 }}
                              animate={{ width: `${planWidth}%` }}
                              transition={{ duration: 1, ease: "circOut" }}
                            />
                            <motion.div
                              className="absolute left-0 top-0 h-full bg-indigo-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "circOut" }}
                            />
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        {semCourses.slice(0, 3).map(
                          (c) =>
                            !c.isPlaceholder && (
                              <div
                                key={c.name}
                                className="flex items-center text-xs text-slate-600"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full mr-2.5 flex-shrink-0 transition-colors ${
                                    planProgress[c.name]?.status === "completed"
                                      ? "bg-green-400"
                                      : planProgress[c.name]?.status ===
                                        "planned"
                                      ? "bg-amber-400"
                                      : "bg-slate-200"
                                  }`}
                                />
                                <span
                                  className={`truncate ${
                                    planProgress[c.name]?.status ===
                                      "completed" && "opacity-40 line-through"
                                  }`}
                                >
                                  {c.name}
                                </span>
                              </div>
                            )
                        )}
                        {semCourses.every((c) => c.isPlaceholder) && (
                          <div className="text-xs text-slate-400 italic">
                            建议修读专业选修
                          </div>
                        )}
                      </div>

                      <div className="absolute bottom-4 right-4 text-slate-200">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          )}

          {activeTab === "electives" && (
            <motion.div
              key="electives"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Form Card */}
              <div className="md:col-span-1">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50">
                  <h3 className="font-bold text-lg mb-6 flex items-center text-slate-800">
                    <Plus className="w-5 h-5 mr-2 text-indigo-600" /> 录入课程
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                        模块分类
                      </label>
                      <div className="relative">
                        <select
                          className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 appearance-none"
                          value={electiveForm.category}
                          onChange={handlePresetSelect}
                        >
                          {DROPDOWN_GROUPS.map((g) => (
                            <optgroup key={g.group} label={g.group}>
                              {g.options.map((o) => (
                                <option key={o.label} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-4 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                        课程名称
                      </label>
                      <input
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="例如：插画设计"
                        value={electiveForm.name}
                        onChange={(e) =>
                          setElectiveForm({
                            ...electiveForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                        学分
                      </label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="2.0"
                        value={electiveForm.credits}
                        onChange={(e) =>
                          setElectiveForm({
                            ...electiveForm,
                            credits: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddElective("planned")}
                        className="bg-amber-50 text-amber-700 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center"
                      >
                        <Clock className="w-4 h-4 mr-1.5" /> 计划
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddElective("completed")}
                        className="bg-indigo-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> 已修
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="md:col-span-2 space-y-3 pb-safe">
                <AnimatePresence>
                  {electives.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                            item.status === "completed"
                              ? "bg-green-50 text-green-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {item.status === "completed" ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <Clock className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                                ALL_STATS_CONFIG[item.category]?.color ||
                                "bg-slate-400"
                              }`}
                            >
                              {item.category}
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {item.credits} 学分
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-700 text-base">
                            {item.name}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleElectiveStatus(item)}
                          className={`p-2.5 rounded-xl ${
                            item.status === "planned"
                              ? "text-indigo-600 bg-indigo-50"
                              : "text-amber-500 bg-amber-50"
                          }`}
                        >
                          <Undo2 className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteElective(item.id)}
                          className="p-2.5 text-slate-300 hover:text-red-500 rounded-xl"
                        >
                          <Trash2 className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {electives.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-slate-400 text-sm font-medium">
                      空空如也，去添加一些课程吧
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 pb-safe"
            >
              {/* Stats Card */}
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <p className="text-indigo-200 text-sm font-bold mb-2">
                    毕业总进度
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-7xl font-black tracking-tighter">
                      {stats.totalEarned}
                    </h2>
                    <span className="text-2xl text-indigo-300 font-bold">
                      / {stats.totalRequired}
                    </span>
                  </div>
                  <div className="mt-4 inline-flex items-center bg-white/10 backdrop-blur px-4 py-2 rounded-xl border border-white/10">
                    <span className="text-sm">GPA: </span>
                    <span className="ml-2 font-bold text-lg">{stats.gpa}</span>
                  </div>
                </div>
              </div>

              {/* 通识核心 Grid */}
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(GE_CORE_MODULES).map((cat) => {
                  const data = stats.breakdown[cat];
                  const isDone = data.earned >= data.required;
                  const config = GE_CORE_MODULES[cat];
                  return (
                    <div
                      key={cat}
                      className={`p-4 rounded-3xl border ${
                        isDone
                          ? "bg-white border-green-200"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${config.color}`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-400 text-sm">
                          {data.earned}/{data.required}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm">
                        {cat.replace("通核-", "")}
                      </h4>
                    </div>
                  );
                })}
              </div>

              {/* 基础汇总 */}
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(BASE_REQUIREMENTS).map((cat) => {
                  const data = stats.breakdown[cat];
                  return (
                    <div
                      key={cat}
                      className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                          {cat}
                        </p>
                        <span className="text-lg font-black text-slate-700">
                          {data.earned}
                        </span>
                      </div>
                      <div
                        className={`w-1.5 h-8 rounded-full ${BASE_REQUIREMENTS[cat].color} opacity-80`}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Semester Detail Modal (Bottom Sheet Style) */}
      <AnimatePresence>
        {selectedSemester && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSemester(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setSelectedSemester(null);
              }}
              // 增加了 pb-safe 以适配 iPhone 底部
              className="fixed bottom-0 left-0 right-0 bg-[#f8fafc] z-50 rounded-t-[2.5rem] h-[85vh] shadow-2xl overflow-hidden flex flex-col pb-safe"
            >
              {/* Drag Handle */}
              <div
                className="w-full flex justify-center pt-3 pb-1 shrink-0"
                onClick={() => setSelectedSemester(null)}
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
              </div>

              <div className="px-8 py-4 flex justify-between items-center bg-white border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    第 {selectedSemester} 学期
                  </h2>
                  <p className="text-slate-400 text-xs font-medium">
                    下滑关闭 · 必修课程
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedSemester(null)}
                  className="p-2 bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-3 pb-20 overscroll-contain">
                {CURRICULUM_DATA[selectedSemester].map((course, idx) => {
                  if (course.isPlaceholder) return null;
                  const record = planProgress[course.name] || {};
                  const status = record.status || "untaken";

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border rounded-3xl p-4 flex items-start gap-4 ${
                        status === "completed"
                          ? "bg-green-50/50 border-green-200"
                          : status === "planned"
                          ? "bg-amber-50/50 border-amber-200"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleToggleFixedCourse(course.name)}
                        className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0 ${
                          status === "completed"
                            ? "bg-green-500 border-green-500 text-white"
                            : status === "planned"
                            ? "bg-amber-400 border-amber-400 text-white"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        {status === "completed" && (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        {status === "planned" && <Clock className="w-4 h-4" />}
                      </motion.button>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4
                            className={`font-bold text-sm ${
                              status === "completed"
                                ? "text-green-800 opacity-60 line-through"
                                : "text-slate-700"
                            }`}
                          >
                            {course.name}
                          </h4>
                          <span
                            className={`text-[10px] text-white px-1.5 py-0.5 rounded font-bold ${
                              ALL_STATS_CONFIG[course.category]?.color
                            }`}
                          >
                            {course.category.slice(0, 2)}
                          </span>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400 font-medium">
                          {course.credits} 学分
                        </div>

                        {(status === "planned" || status === "completed") && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-3"
                          >
                            <input
                              type="number"
                              placeholder="输入分数..."
                              value={record.score || ""}
                              onChange={(e) =>
                                handleUpdateFixedScore(
                                  course.name,
                                  e.target.value
                                )
                              }
                              className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                <div className="h-10" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
