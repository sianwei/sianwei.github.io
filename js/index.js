// ========== 統一頁面切換方法 ==========
function goToPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById('homePage').style.display = 'none';
    // 顯示目標頁面
    document.getElementById(pageId).style.display = 'block';
    // 進入列表頁自動加載數據
    if(pageId === 'charListPage') showAllCharacters();
    if(pageId === 'teamListPage') showAllTeams();
    // 重置新增頁圖片預覽
    if(pageId === 'addCharPage'){
        currentAddImgBase64 = '';
        resetImgPreview('addImgPreview');
    }
}

// 默認顯示首頁
window.onload = function(){
    document.getElementById('homePage').style.display = 'block';
};