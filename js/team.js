// ========== 隊伍管理：動態生成隊伍輸入框 ==========
function createTeamInput(num) {
    const container = document.getElementById('teamInputContainer');
    container.innerHTML = '';
    const teamMsg = document.getElementById('teamMsg');
    teamMsg.innerHTML = '';
    if(num == 0) return;
    for(let i=1; i<=num; i++){
        const inputRow = document.createElement('div');
        inputRow.className = 'team-item-row';
        const charInput = document.createElement('input');
        charInput.type = 'text';
        charInput.id = `teamChar${i}`;
        charInput.className = 'team-char-input';
        charInput.placeholder = `第 ${i} 位角色`;
        charInput.addEventListener('input', function(){ searchCharacter(this, i) });
        charInput.addEventListener('blur', function(){ setTimeout(()=>{
            const suggest = document.getElementById(`suggest${i}`);
            if(suggest) suggest.style.display='none';
        },200) });

        const attrSelect = document.createElement('select');
        attrSelect.id = `teamAttr${i}`;
        attrSelect.className = 'team-attr-select';
        allAttrs.forEach(attr => {
            const opt = document.createElement('option');
            opt.value = attr;
            opt.textContent = attr;
            attrSelect.appendChild(opt);
        });

        const suggestList = document.createElement('div');
        suggestList.id = `suggest${i}`;
        suggestList.className = 'suggest-list';
        suggestList.style.display = 'none';

        inputRow.appendChild(charInput);
        inputRow.appendChild(attrSelect);
        inputRow.appendChild(suggestList);
        container.appendChild(inputRow);
    }
}

// ========== 隊伍管理：動態生成修改隊伍輸入框 ==========
function createEditTeamInput(num) {
    const container = document.getElementById('editTeamInputContainer');
    container.innerHTML = '';
    if(num == 0) return;
    for(let i=1; i<=num; i++){
        const inputRow = document.createElement('div');
        inputRow.className = 'team-item-row';
        const charInput = document.createElement('input');
        charInput.type = 'text';
        charInput.id = `editTeamChar${i}`;
        charInput.className = 'team-char-input';
        charInput.placeholder = `第 ${i} 位角色`;
        charInput.addEventListener('input', function(){ searchCharacter(this, i, 'edit') });
        charInput.addEventListener('blur', function(){ setTimeout(()=>{
            const suggest = document.getElementById(`editSuggest${i}`);
            if(suggest) suggest.style.display='none';
        },200) });

        const attrSelect = document.createElement('select');
        attrSelect.id = `editTeamAttr${i}`;
        attrSelect.className = 'team-attr-select';
        allAttrs.forEach(attr => {
            const opt = document.createElement('option');
            opt.value = attr;
            opt.textContent = attr;
            attrSelect.appendChild(opt);
        });

        const suggestList = document.createElement('div');
        suggestList.id = `editSuggest${i}`;
        suggestList.className = 'suggest-list';
        suggestList.style.display = 'none';

        inputRow.appendChild(charInput);
        inputRow.appendChild(attrSelect);
        inputRow.appendChild(suggestList);
        container.appendChild(inputRow);
    }
}

// ========== 隊伍管理：智能模糊匹配 ==========
async function searchCharacter(inputObj, idx, type='add') {
    const keyword = inputObj.value.trim();
    const suggestId = type == 'edit' ? `editSuggest${idx}` : `suggest${idx}`;
    const suggestBox = document.getElementById(suggestId);
    suggestBox.innerHTML = "";
    if(keyword.length === 0){
        suggestBox.style.display = 'none';
        return;
    }
    try{
        const query = new AV.Query('Character');
        query.contains('name', keyword);
        const chars = await query.find();
        const charNames = [...new Set(chars.map(c=>c.toJSON().name))];
        if(charNames.length === 0){
            suggestBox.innerHTML = `<div class="suggest-empty">無匹配角色</div>`;
            suggestBox.style.display = 'block';
            return;
        }
        charNames.forEach((name, index) => {
            const item = document.createElement('div');
            item.className = 'suggest-item';
            item.innerHTML = `${index+1}: ${name}`;
            item.onclick = function(){
                inputObj.value = name;
                suggestBox.style.display = 'none';
            }
            suggestBox.appendChild(item);
        });
        suggestBox.style.display = 'block';
    }catch(err){
        suggestBox.innerHTML = `<div class="suggest-empty">加載失敗</div>`;
        suggestBox.style.display = 'block';
    }
}

// ========== 隊伍管理：新增隊伍 ==========
async function addTeam() {
    const teamNum = document.getElementById('teamNum').value;
    const teamName = document.getElementById('teamName').value.trim();
    const teamDesc = document.getElementById('teamDesc').value.trim();
    const teamMsg = document.getElementById('teamMsg');
    let teamChars = [];
    let charCodes = [];
    let isEmpty = false;

    if(teamNum == 0){ teamMsg.textContent = "⚠️ 請先選擇隊伍角色數量！"; teamMsg.className = "warn"; return; }
    if(!teamName){ teamMsg.textContent = "⚠️ 隊伍名稱為必填！"; teamMsg.className = "warn"; return; }

    for(let i=1; i<=teamNum; i++){
        const charVal = document.getElementById(`teamChar${i}`).value.trim();
        const attrVal = document.getElementById(`teamAttr${i}`).value;
        if(!charVal){ 
            teamMsg.textContent = `⚠️ 第 ${i} 位角色名稱不可為空！`; 
            teamMsg.className = "warn"; 
            isEmpty = true; 
            break; 
        }
        teamChars.push(`${charVal}【${attrVal}】`);
        charCodes.push(generateCharCode(charVal, attrVal));
    }
    if(isEmpty) return;

    try{
        const teamCode = generateTeamCode(teamNum, charCodes);
        if(await checkCodeIsExist(teamCode, 'team')){
            teamMsg.textContent = `⚠️ 重複登記！該隊伍組合已存在！`;
            teamMsg.className = "warn";
            return;
        }
        const teamScene = teamNum ==3 ? "工會戰/占領戰" : (teamNum ==4 ? "競技場" : "RTA/副本");
        const team = new TeamTable();
        team.set('teamName', teamName);
        team.set('teamNum', teamNum);
        team.set('teamScene', teamScene);
        team.set('teamChars', teamChars);
        team.set('teamDesc', teamDesc || "暫無隊伍備註");
        team.set('teamCode', teamCode);
        await team.save();

        teamMsg.textContent = "✅ 隊伍登記成功！";
        teamMsg.className = "success";
        document.getElementById('teamNum').value = 0;
        document.getElementById('teamName').value = "";
        document.getElementById('teamDesc').value = "";
        document.getElementById('teamInputContainer').innerHTML = "";
    }catch(err){
        teamMsg.textContent = "⚠️ 新增失敗："+err.message;
        teamMsg.className = "warn";
    }
}

// ========== 隊伍管理：查詢所有隊伍 ==========
async function showAllTeams() {
    const listBox = document.getElementById('teamList');
    listBox.innerHTML = "<div class='empty-tip'>加載中...</div>";
    try{
        const query = new AV.Query('Team');
        const teams = await query.find();
        if(teams.length === 0){
            listBox.innerHTML = "<p class='empty-tip'>暫無登記隊伍，請先登記隊伍！</p>";
            return;
        }
        listBox.innerHTML = "";
        teams.forEach(team => {
            const teamData = team.toJSON();
            let charList = "";
            teamData.teamChars.forEach((char,index)=>{ charList += `${index+1}. ${char}<br>`; });
            
            const teamItem = document.createElement('div');
            teamItem.className = "item-box";
            teamItem.innerHTML = `
            <div class="char-info">
                <strong>隊伍名：${teamData.teamName}</strong> <br>
                適用場景：${teamData.teamScene} <br>
                隊伍成員：<br>${charList}
                隊伍備註：${teamData.teamDesc} <br>
                <div class="code-box">隊伍專屬CODE：${teamData.teamCode}</div>
                <div class="btn-group">
                    <button class="edit-btn" onclick="editTeam('${team.id}')">✏️ 修改隊伍</button>
                    <button class="del-btn" onclick="delTeam('${team.id}')">🗑️ 刪除隊伍</button>
                </div>
            </div>`;
            listBox.appendChild(teamItem);
        });
    }catch(err){
        listBox.innerHTML = `<p class='warn'>加載失敗：${err.message}</p>`;
    }
}

// ========== 隊伍管理：打開修改彈窗 ==========
async function editTeam(teamId) {
    try{
        const team = await AV.Object.createWithoutData('Team', teamId).fetch();
        const teamData = team.toJSON();
        document.getElementById('editTeamId').value = teamId;
        document.getElementById('editTeamNum').value = teamData.teamNum;
        document.getElementById('editTeamCode').value = teamData.teamCode;
        document.getElementById('editTeamName').value = teamData.teamName;
        document.getElementById('editTeamDesc').value = teamData.teamDesc;
        
        createEditTeamInput(teamData.teamNum);
        teamData.teamChars.forEach((charStr, index) => {
            const idx = index + 1;
            const reg = /(.*)【(.*)】/;
            const match = charStr.match(reg);
            if(match){
                document.getElementById(`editTeamChar${idx}`).value = match[1];
                document.getElementById(`editTeamAttr${idx}`).value = match[2];
            }
        });
        document.getElementById('editTeamModal').style.display = "flex";
    }catch(err){
        alert("加載隊伍失敗："+err.message);
    }
}

// ========== 隊伍管理：保存隊伍修改 ==========
async function saveTeamEdit() {
    const teamId = document.getElementById('editTeamId').value;
    const oldTeamCode = document.getElementById('editTeamCode').value;
    const editTeamNum = document.getElementById('editTeamNum').value;
    const editTeamName = document.getElementById('editTeamName').value.trim();
    const editTeamDesc = document.getElementById('editTeamDesc').value.trim();
    let editTeamChars = [];
    let charCodes = [];
    let isEmpty = false;

    if(!editTeamName){ alert("⚠️ 隊伍名稱為必填！"); return; }
    for(let i=1; i<=editTeamNum; i++){
        const charVal = document.getElementById(`editTeamChar${i}`).value.trim();
        const attrVal = document.getElementById(`editTeamAttr${i}`).value;
        if(!charVal){ 
            alert(`⚠️ 第 ${i} 位角色名稱不可為空！`);
            isEmpty = true; 
            break; 
        }
        editTeamChars.push(`${charVal}【${attrVal}】`);
        charCodes.push(generateCharCode(charVal, attrVal));
    }
    if(isEmpty) return;

    try{
        const newTeamCode = generateTeamCode(editTeamNum, charCodes);
        if(newTeamCode !== oldTeamCode && await checkCodeIsExist(newTeamCode, 'team')){
            alert(`⚠️ 重複修改！修改後的隊伍組合已存在！`);
            return;
        }
        const team = AV.Object.createWithoutData('Team', teamId);
        team.set('teamName', editTeamName);
        team.set('teamChars', editTeamChars);
        team.set('teamDesc', editTeamDesc || "暫無隊伍備註");
        team.set('teamCode', newTeamCode);
        await team.save();
        closeTeamModal();
        showAllTeams();
        alert("✅ 隊伍修改成功！");
    }catch(err){
        alert("修改失敗："+err.message);
    }
}

// ========== 隊伍管理：關閉修改彈窗 ==========
function closeTeamModal() { 
    document.getElementById('editTeamModal').style.display = "none"; 
}

// ========== 隊伍管理：刪除隊伍 ==========
async function delTeam(teamId) {
    if(!confirm("⚠️ 確定要刪除這個隊伍嗎？刪除後無法復原！")) return;
    try{
        const team = AV.Object.createWithoutData('Team', teamId);
        await team.destroy();
        showAllTeams();
    }catch(err){
        alert("刪除失敗："+err.message);
    }
}