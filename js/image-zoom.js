// 图片点击放大功能
document.addEventListener('DOMContentLoaded', function() {
  // 创建图片放大查看器
  const imageViewer = document.createElement('div');
  imageViewer.className = 'image-viewer';
  imageViewer.innerHTML = '<div class="image-viewer-container"><img src="" alt="" class="view-image"><span class="close-viewer">&times;</span></div>';
  document.body.appendChild(imageViewer);

  // 获取查看器中的图片元素
  const viewImage = imageViewer.querySelector('.view-image');
  
  // 状态变量
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  
  // 鼠标拖拽相关变量
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // 移动端触控相关变量
  let startDist = 0;
  let startScale = 1;
  let lastTouchX = 0;
  let lastTouchY = 0;

  // 更新图片变换样式的函数
  function updateTransform() {
    viewImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  // --- 电脑端：鼠标滚轮缩放 ---
  viewImage.addEventListener('wheel', function(e) {
    e.preventDefault(); 
    const delta = e.deltaY * -0.001; 
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    scale = newScale;
    updateTransform();
  });

  // --- 电脑端：鼠标拖拽 ---
  viewImage.addEventListener('mousedown', function(e) {
    if (e.button === 0) { 
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      viewImage.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      e.preventDefault();
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    }
  });

  document.addEventListener('mouseup', function() {
    if (isDragging) {
      isDragging = false;
      viewImage.style.cursor = 'grab';
    }
  });

  // --- 移动端：触控逻辑 ---
  
  // 计算两个触摸点之间的距离
  function getDistance(touch1, touch2) {
    return Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
  }

  viewImage.addEventListener('touchstart', function(e) {
    // 单指触摸：准备拖拽
    if (e.touches.length === 1) {
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
    } 
    // 双指触摸：准备缩放
    else if (e.touches.length === 2) {
      e.preventDefault(); // 防止浏览器默认缩放
      startDist = getDistance(e.touches[0], e.touches[1]);
      startScale = scale; // 记录开始缩放时的当前倍率
    }
  }, { passive: false });

  viewImage.addEventListener('touchmove', function(e) {
    e.preventDefault(); // 防止页面滚动

    // 单指移动：执行拖拽
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - lastTouchX;
      const deltaY = e.touches[0].clientY - lastTouchY;
      
      translateX += deltaX;
      translateY += deltaY;
      
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      updateTransform();
    } 
    // 双指移动：执行缩放
    else if (e.touches.length === 2) {
      const newDist = getDistance(e.touches[0], e.touches[1]);
      if (newDist > 0 && startDist > 0) {
        // 计算缩放比例
        const zoomFactor = newDist / startDist;
        // 应用到初始倍率
        let newScale = startScale * zoomFactor;
        // 限制缩放范围 (0.5x - 5x)
        scale = Math.min(Math.max(0.5, newScale), 5);
        updateTransform();
      }
    }
  }, { passive: false });

  // --- 初始化与关闭逻辑 ---

  const postImages = document.querySelectorAll('.post-content img');

  postImages.forEach(img => {
    img.style.cursor = 'pointer'; 
    img.addEventListener('click', function() {
      viewImage.src = this.src;
      viewImage.alt = this.alt;
      
      // 重置状态
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
      viewImage.style.cursor = 'grab'; 

      imageViewer.classList.add('active');
      document.body.style.overflow = 'hidden'; 
    });
  });

  const closeViewer = imageViewer.querySelector('.close-viewer');
  closeViewer.addEventListener('click', closeImageViewer);
  imageViewer.addEventListener('click', function(e) {
    if (e.target === imageViewer || e.target.classList.contains('image-viewer-container')) {
      closeImageViewer();
    }
  });

  function closeImageViewer() {
    imageViewer.classList.remove('active');
    document.body.style.overflow = ''; 
    setTimeout(() => {
        scale = 1; 
        translateX = 0; 
        translateY = 0; 
        updateTransform();
    }, 300);
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
      closeImageViewer();
    }
  });
});