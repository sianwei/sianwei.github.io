// 全局常量配置
const allAttrs = ["風", "火", "水", "光", "暗"];
const attrShortCode = { "風":"wi", "火":"fr", "水":"wa", "光":"li", "暗":"da" };
// 圖片Base64存儲
let currentAddImgBase64 = '';
let currentEditImgBase64 = '';

// ========== 公共方法：圖片預覽 + 轉Base64 ==========
function previewImg(fileObj, previewId) {
    const file = fileObj.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewBox = document.getElementById(previewId);
        previewBox.innerHTML = `<img src="${e.target.result}" class="char-img">`;
        if(previewId === 'addImgPreview'){
            currentAddImgBase64 = e.target.result;
        }else{
            currentEditImgBase64 = e.target.result;
        }
    }
    reader.readAsDataURL(file);
}

// ========== 公共方法：重置圖片預覽框 ==========
function resetImgPreview(previewId) {
    const previewBox = document.getElementById(previewId);
    previewBox.innerHTML = `<div class="char-no-img">點擊下方按鈕<br>上傳角色圖片</div>`;
}

// ========== 公共方法：生成角色CODE ==========
function generateCharCode(charName, attr) {
    const attrCode = attrShortCode[attr];
    const urlEncodeName = encodeURIComponent(charName);
    return `cr/el/${attrCode}:${urlEncodeName}`;
}

// ========== 公共方法：生成隊伍CODE ==========
function generateTeamCode(teamNum, charCodes) {
    return `${teamNum}ut/lead:(${charCodes.join(';')})`;
}

// ========== 公共方法：驗證CODE是否存在 (适配Firebase，替换原方法即可) ==========
async function checkCodeIsExist(code, type) {
    try{
        const ref = type === 'character' ? window.charRef : window.teamRef;
        const snapshot = await ref.orderByChild(type === 'character' ? 'charCode' : 'teamCode').equalTo(code).once('value');
        return snapshot.exists();
    }catch(err){
        alert("驗證數據失敗："+err.message);
        return false;
    }
}
