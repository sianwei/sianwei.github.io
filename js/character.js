// ========== 角色管理：新增角色 (Firebase完整版，无任何LeanCloud代码) ==========
async function addCharacter() {
    const charName = document.getElementById('charName').value.trim();
    const charAttr = document.getElementById('charAttr').value;
    const charDesc = document.getElementById('charDesc').value.trim();
    const msg = document.getElementById('msg');
    if (!charName) {
        msg.textContent = "⚠️ 角色名稱為必填，請輸入名稱後再新增！";
        msg.className = "warn";
        return;
    }
    msg.textContent = "";

    try{
        if(charAttr === "全部"){
            for(let attr of allAttrs){
                const charCode = generateCharCode(charName, attr);
                if(await checkCodeIsExist(charCode, 'character')){
                    msg.textContent = `⚠️ 重複新增！【${attr}屬性-${charName}】已存在！`;
                    msg.className = "warn";
                    return;
                }
                // Firebase新增数据
                const charId = getUUID();
                await window.charRef.child(charId).set({
                    id: charId,
                    name: charName,
                    attr: attr,
                    desc: charDesc || "暫無備註",
                    charCode: charCode,
                    charImg: currentAddImgBase64 || ''
                });
            }
            msg.textContent = "✅ 新增成功！已添加5個屬性版本";
        } else {
            const charCode = generateCharCode(charName, charAttr);
            if(await checkCodeIsExist(charCode, 'character')){
                msg.textContent = `⚠️ 重複新增！【${charAttr}屬性-${charName}】已存在！`;
                msg.className = "warn";
                return;
            }
            // Firebase新增数据
            const charId = getUUID();
            await window.charRef.child(charId).set({
                id: charId,
                name: charName,
                attr: charAttr,
                desc: charDesc || "暫無備註",
                charCode: charCode,
                charImg: currentAddImgBase64 || ''
            });
            msg.textContent = "✅ 新增角色成功！";
        }
        // 重置表单
        document.getElementById('charName').value = "";
        document.getElementById('charDesc').value = "";
        currentAddImgBase64 = '';
        resetImgPreview('addImgPreview');
        msg.className = "success";
    }catch(err){
        msg.textContent = "⚠️ 新增失敗："+err.message;
        msg.className = "warn";
    }
}

// ========== 角色管理：查詢所有角色 (Firebase完整版，渲染列表) ==========
async function showAllCharacters() {
    const listBox = document.getElementById('characterList');
    listBox.innerHTML = "<div class='empty-tip'>加載中...</div>";
    try{
        if(!window.charRef) {
            listBox.innerHTML = "<div class='empty-tip'>數據庫加載中，請刷新頁面再試！</div>";
            return;
        }
        const snapshot = await window.charRef.once('value');
        const charsObj = snapshot.val() || {};
        const chars = Object.values(charsObj);
        
        if(chars.length === 0){
            listBox.innerHTML = "<p class='empty-tip'>暫無魔靈角色，請先新增角色！</p>";
            return;
        }
        listBox.innerHTML = "";
        chars.forEach(charData => {
            let charImgHtml = charData.charImg ? 
                `<div class="char-img-box"><img src="${charData.charImg}" class="char-img"></div>` :
                `<div class="char-img-box"><div class="char-no-img">無角色圖片</div></div>`;
            
            const charItem = document.createElement('div');
            charItem.className = "item-box";
            charItem.innerHTML = `${charImgHtml}
            <div class="char-info">
                <strong>角色：${charData.name}</strong> <br>屬性：${charData.attr} <br>攻略備註：${charData.desc}
                <div class="code-box">角色專屬CODE：${charData.charCode}</div>
                <div class="btn-group">
                    <button class="edit-btn" onclick="editCharacter('${charData.id}')">✏️ 修改</button>
                    <button class="del-btn" onclick="delCharacter('${charData.id}')">🗑️ 刪除</button>
                </div>
            </div>`;
            listBox.appendChild(charItem);
        });
    }catch(err){
        listBox.innerHTML = `<p class='warn'>加載失敗：${err.message}</p>`;
    }
}

// ========== 角色管理：刪除角色 (Firebase完整版) ==========
async function delCharacter(charId) {
    if(!confirm("⚠️ 確定要刪除這個魔靈角色嗎？刪除後無法復原！")) return;
    try{
        await window.charRef.child(charId).remove();
        showAllCharacters();
    }catch(err){
        alert("刪除失敗："+err.message);
    }
}

// ========== 角色管理：打開修改彈窗 (Firebase完整版) ==========
async function editCharacter(charId) {
    try{
        if(!window.charRef) {
            alert("數據庫加載中，請稍等！");
            return;
        }
        const snapshot = await window.charRef.child(charId).once('value');
        const charData = snapshot.val();
        if(!charData) {
            alert("角色數據不存在！");
            return;
        }
        document.getElementById('editId').value = charId;
        document.getElementById('editCharCode').value = charData.charCode;
        document.getElementById('editCharImg').value = charData.charImg || '';
        document.getElementById('editName').value = charData.name;
        document.getElementById('editAttr').value = charData.attr;
        document.getElementById('editDesc').value = charData.desc;
        
        const previewBox = document.getElementById('editImgPreview');
        currentEditImgBase64 = charData.charImg || '';
        if(charData.charImg){
            previewBox.innerHTML = `<img src="${charData.charImg}" class="char-img">`;
        }else{
            previewBox.innerHTML = `<div class="char-no-img">當前無圖片<br>可點擊更換</div>`;
        }
        document.getElementById('editModal').style.display = "flex";
    }catch(err){
        alert("加載角色失敗："+err.message);
    }
}

// ========== 角色管理：保存修改 (Firebase完整版) ==========
async function saveEdit() {
    const charId = document.getElementById('editId').value;
    const oldCode = document.getElementById('editCharCode').value;
    const oldImg = document.getElementById('editCharImg').value;
    const editName = document.getElementById('editName').value.trim();
    const editAttr = document.getElementById('editAttr').value;
    const editDesc = document.getElementById('editDesc').value.trim();
    if(!editName){ alert("⚠️ 角色名稱為必填！"); return; }

    try{
        const newCode = generateCharCode(editName, editAttr);
        if(newCode !== oldCode && await checkCodeIsExist(newCode, 'character')){
            alert(`⚠️ 重複修改！【${editAttr}屬性-${editName}】已存在！`);
            return;
        }
        await window.charRef.child(charId).update({
            name: editName,
            attr: editAttr,
            desc: editDesc || "暫無備註",
            charCode: newCode,
            charImg: currentEditImgBase64 || oldImg
        });
        closeModal();
        showAllCharacters();
        alert("✅ 修改成功！角色資料已更新");
    }catch(err){
        alert("修改失敗："+err.message);
    }
}

// ========== 角色管理：關閉修改彈窗 (不变) ==========
function closeModal() { 
    document.getElementById('editModal').style.display = "none"; 
    currentEditImgBase64 = '';
}
