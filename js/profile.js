// 编辑资料功能
let isEditing = false;
const editButton = document.getElementById('editProfileBtn');
const inputFields = document.querySelectorAll('.trending-item .trend-name input');


// 切换编辑模式
function toggleEditMode() {
  isEditing = !isEditing;
  
  if (isEditing) {
    // 进入编辑模式
    editButton.textContent = '保存';
    
    inputFields.forEach(input => {
      input.removeAttribute('readonly');
      input.style.cursor = 'text';
    });
    
  } else {
    // 退出编辑模式
    editButton.textContent = '编辑资料';
    
    inputFields.forEach(input => {
      input.setAttribute('readonly', 'true');
      input.style.cursor = 'default';
    });
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    inputFields.forEach(input => {
      input.setAttribute('readonly', 'true');
      input.style.cursor = 'default';
    });
  editButton.addEventListener('click', toggleEditMode);
});
