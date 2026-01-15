// ========== Firebase 实时数据库配置 (已补全你的所有信息+databaseURL，直接复制即用) ==========
const firebaseConfig = {
  apiKey: "AIzaSyBKqeqeE13Cum1m-OYMytrXAWWvxHkRqCM",
  authDomain: "summoners-war-sian-s-wiki.firebaseapp.com",
  databaseURL: "https://summoners-war-sian-s-wiki-default-rtdb.asia-southeast1.firebasedatabase.app/", // 这是你刚复制的地址
  projectId: "summoners-war-sian-s-wiki",
  storageBucket: "summoners-war-sian-s-wiki.firebasestorage.app",
  messagingSenderId: "720881699552",
  appId: "1:720881699552:web:597bbcae1081e69837de85"
};

// ========== Firebase 初始化 + 全局挂载数据库对象 (无需修改任何内容，适配你的所有功能) ==========
(function(){
    // 引入兼容原生JS的Firebase SDK，无需模块化import
    const script1 = document.createElement('script');
    script1.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js';
    script1.onload = function(){
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js';
        script2.onload = function(){
            // 初始化Firebase
            firebase.initializeApp(firebaseConfig);
            // 全局挂载数据库引用，你的角色/队伍增删改查都靠这个
            window.db = firebase.database().ref();
            window.charRef = window.db.child('characters'); // 角色数据表
            window.teamRef = window.db.child('teams');     // 队伍数据表
            console.log("✅ Firebase实时数据库初始化成功！多人数据实时同步生效 ✅");
        };
        document.head.appendChild(script2);
    };
    document.head.appendChild(script1);
})();
