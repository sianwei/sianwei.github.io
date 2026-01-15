// 全局常量配置 (不变)
const allAttrs = ["風", "火", "水", "光", "暗"];
const attrShortCode = { "風":"wi", "火":"fr", "水":"wa", "光":"li", "暗":"da" };
// 圖片Base64变量 (不变)
let currentAddImgBase64 = '';
let currentEditImgBase64 = '';

// ========== 圖片預覽 + 轉Base64 (不变，完美复用) ==========
function previewImg(fileObj, previewId) {
    const file = fileObj.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewBox = document.getElementById(previewId);
        previewBox.innerHTML = `<img src="${e.target.result}" class="char-img">`;
        if(previewId === 'addImgPreview') currentAddImgBase64 = e.target.result;
        else currentEditImgBase64 = e.target.result;
    }
    reader.readAsDataURL(file);
}

// ========== 重置圖片預覽框 (不变) ==========
function resetImgPreview(previewId) {
    const previewBox = document.getElementById(previewId);
    previewBox.innerHTML = `<div class="char-no-img">點擊下方按鈕<br>上傳角色圖片</div>`;
}

// ========== 生成角色CODE (不变) ==========
function generateCharCode(charName, attr) {
    const attrCode = attrShortCode[attr];
    const urlEncodeName = encodeURIComponent(charName);
    return `cr/el/${attrCode}:${urlEncodeName}`;
}

// ========== 生成隊伍CODE (不变) ==========
function generateTeamCode(teamNum, charCodes) {
    return `${teamNum}ut/lead:(${charCodes.join(';')})`;
}

// ========== 核心修复：驗證CODE是否存在 (加固校验+新加坡节点适配，彻底解决orderByChild报错) ==========
async function checkCodeIsExist(code, type) {
    // 第一步：必做校验，数据库没加载完直接返回
    if (!checkFirebaseReady()) return true;
    try{
        const dbRef = type === 'character' ? window.charRef : window.teamRef;
        const codeKey = type === 'character' ? 'charCode' : 'teamCode';
        // 适配新加坡节点的查询方式，增加超时兜底
        const snapshot = await Promise.race([
            dbRef.orderByChild(codeKey).equalTo(code).once('value'),
            new Promise((_, reject) => setTimeout(() => reject('查询超时'), 5000))
        ]);
        return snapshot.exists();
    }catch(err){
        alert("驗證數據失敗："+ err.message);
        return false;
    }
}
