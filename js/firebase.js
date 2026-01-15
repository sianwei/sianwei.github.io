// ========== Firebase 实时数据库配置 (你的完整配置，无需修改) ==========
const firebaseConfig = {
  apiKey: "AIzaSyBKqeqeE13Cum1m-OYMytrXAWWvxHkRqCM",
  authDomain: "summoners-war-sian-s-wiki.firebaseapp.com",
  databaseURL: "https://summoners-war-sian-s-wiki-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "summoners-war-sian-s-wiki",
  storageBucket: "summoners-war-sian-s-wiki.firebasestorage.app",
  messagingSenderId: "720881699552",
  appId: "1:720881699552:web:597bbcae1081e69837de85"
};

// ========== Firebase初始化 + 全局挂载数据库对象 (修复挂载问题，核心！) ==========
(function(){
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
    script1.onload = function(){
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
        script2.onload = function(){
            window.firebase = firebase;
            firebase.initializeApp(firebaseConfig);
            // 全局挂载 角色/队伍 数据库引用，所有页面直接调用，不会undefined！
            window.charRef = firebase.database().ref('characters');
            window.teamRef = firebase.database().ref('teams');
            console.log("✅ Firebase初始化成功！数据库对象挂载完成 ✅");
        };
        document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
})();

// 全局工具函数：生成唯一ID（Firebase新增数据用）
function getUUID() {
    return 'id_' + Date.now() + Math.floor(Math.random()*1000);
}
