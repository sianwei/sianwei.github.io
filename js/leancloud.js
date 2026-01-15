// ========== Firebase 实时数据库配置 (你的真实地址：asia-southeast1 新加坡，已填好，无需修改！) ==========
const firebaseConfig = {
  apiKey: "AIzaSyBKqeqeE13Cum1m-OYMytrXAWWvxHkRqCM",
  authDomain: "summoners-war-sian-s-wiki.firebaseapp.com",
  databaseURL: "https://summoners-war-sian-s-wiki-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "summoners-war-sian-s-wiki",
  storageBucket: "summoners-war-sian-s-wiki.firebasestorage.app",
  messagingSenderId: "720881699552",
  appId: "1:720881699552:web:597bbcae1081e69837de85"
};

// ========== 核心修复：强制加载Firebase + 确保全局对象挂载成功 (解决undefined的关键！) ==========
let firebaseReady = false; // 标记数据库是否加载完成
(function(){
    // 先加载核心库
    const scriptApp = document.createElement('script');
    scriptApp.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.min.js';
    scriptApp.async = false; // 同步加载，必须加载完成再下一步
    scriptApp.onload = function(){
        const scriptDb = document.createElement('script');
        scriptDb.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.min.js';
        scriptDb.async = false;
        scriptDb.onload = function(){
            try {
                window.firebase = firebase;
                firebase.initializeApp(firebaseConfig);
                // 全局挂载数据库对象，永久有效
                window.db = firebase.database();
                window.charRef = window.db.ref('characters');
                window.teamRef = window.db.ref('teams');
                firebaseReady = true;
                console.log("✅ Firebase初始化成功！新加坡节点适配完成 ✅");
            } catch (err) {
                alert("数据库初始化失败：" + err.message);
            }
        };
        document.head.appendChild(scriptDb);
    };
    document.head.appendChild(scriptApp);
})();

// 全局工具函数：生成唯一ID (新增数据用)
function getUUID() {
    return 'id_' + Date.now() + Math.floor(Math.random() * 9999);
}

// 全局工具函数：数据库就绪校验 (所有操作前必调，彻底解决undefined)
function checkFirebaseReady() {
    if (!firebaseReady || !window.charRef || !window.teamRef) {
        alert("⚠️ 数据库正在加载中，请等待3秒后再操作，或刷新页面重试！");
        return false;
    }
    return true;
}
