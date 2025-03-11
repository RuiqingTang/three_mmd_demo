//第一版
//--------------------------------------------------------------------------------------------
// import scene from "./scene";
// import * as THREE from "three";
// import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
// import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper.js";
// import camera from "./camera";

// export const helper = new MMDAnimationHelper();

// export class Loader {
//   loadModels() {
//     const loader = new MMDLoader();

//     loader.loadWithAnimation(
//       "/public/hutao/胡桃.pmx", // called when the resource is loaded
//       "./public/move/ayaka-dance.vmd",
//       function onLoad(mmd) {
//         const { mesh } = mmd;
//         helper.add(mmd.mesh, {
//           animation: mmd.animation,
//         });

//         scene.getScene().add(mmd.mesh);
//       }
//     );

//     loader.loadAnimation(
//       "./public/move/ayaka-camera.vmd",
//       camera.getCamera(),
//       function (cameraAnimation) {
//         helper.add(camera.getCamera(), {
//           animation: cameraAnimation as THREE.AnimationClip,
//         });
//       }
//     );
//   }
// }

// export default new Loader();
//-------------------------------------------------------------------------------





//第二版 交互播放，无法保证音频和动画同步
//--------------------------------------------------------------------------------------
// import scene from "./scene";
// import * as THREE from "three";
// import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
// import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper.js";
// import camera from "./camera";

// export const helper = new MMDAnimationHelper();
// helper.enable('ik', false);

// // 创建音频对象
// const audioElement = new Audio();
// audioElement.src = "./assets/wavs/JN_Style.wav";
// audioElement.load(); // 预加载音频
// audioElement.volume = 1.0; // 确保音量足够

// // 添加音频加载事件监听
// audioElement.addEventListener('canplaythrough', () => {
//   console.log('音频已加载完成，可以播放');
// });

// // 添加错误监听
// audioElement.addEventListener('error', (e) => {
//   console.error('音频加载错误:', e);
// });

// export class Loader {
//   loadModels() {
//     const loader = new MMDLoader();

//     loader.loadWithAnimation(
//       "./assets/klee/可莉2.0.pmx", // called when the resource is loaded
//       "./assets/animations/for_vmd.vmd",
//       function onLoad(mmd) {
//         const { mesh } = mmd;
//         helper.add(mmd.mesh, {
//           animation: mmd.animation,
//         });
        

//         scene.getScene().add(mmd.mesh);
        
//         // 调整相机位置以便能看到模型全身
//         camera.getCamera().position.set(0, 10, 15);
//         camera.getCamera().lookAt(0, 10, 0);
//         const frameRate = 30; // 帧率，根据实际情况调整
//         const delayInSeconds = 108 / frameRate;
        
//         // 添加用户交互检测
//         const playAudio = () => {
//           setTimeout(() => {
//             console.log('尝试播放音频...');
//             const playPromise = audioElement.play();
            
//             if (playPromise !== undefined) {
//               playPromise.then(() => {
//                 console.log('音频播放成功');
//                 // 成功播放后移除事件监听器
//                 document.removeEventListener('click', playAudio);
//               }).catch(error => {
//                 console.error("音频播放失败:", error);
//                 // 如果是自动播放策略阻止，则等待用户交互
//                 document.addEventListener('click', playAudio, { once: true });
//               });
//             }
//           }, delayInSeconds * 1000);
//         };
        
//         // 尝试直接播放
//         playAudio();
        
//         // 同时添加点击事件监听，以防自动播放被阻止
//         document.addEventListener('click', playAudio, { once: true });
//       }
//     );

//     // 移除了镜头动画加载部分
//   }
// }

// export default new Loader();
//--------------------------------------------------------------------------------------------

//第三版
//--------------------------------------------------------------------------------------------
import scene from "./scene";
import * as THREE from "three";
import { MMDLoader } from "three/examples/jsm/loaders/MMDLoader.js";
import { MMDAnimationHelper } from "three/examples/jsm/animation/MMDAnimationHelper.js";
import camera from "./camera";

export const helper = new MMDAnimationHelper();
helper.enable('ik', false);

// 使用 Web Audio API 代替 HTML5 Audio
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
let audioBuffer: AudioBuffer | null = null;
let audioSource: AudioBufferSourceNode | null = null;
let isModelLoaded = false;
let mmdData: any = null;

// 预加载音频
fetch("./assets/wavs/JN_Style.wav")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.arrayBuffer();
  })
  .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
  .then(buffer => {
    audioBuffer = buffer;
    console.log('音频已加载完成，可以播放');
    checkAndCreateStartButton();
  })
  .catch(error => {
    console.error('音频加载错误:', error);
  });

// 播放音频的函数
function playAudio(delayInSeconds: number) {
  if (!audioBuffer) {
    console.error('音频尚未加载完成');
    return;
  }

  // 如果已经有音源在播放，先停止它
  if (audioSource) {
    audioSource.stop();
  }

  // 创建新的音源
  audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  
  // 连接到音频输出
  audioSource.connect(audioContext.destination);
  
  // 计算开始时间
  const startTime = audioContext.currentTime + delayInSeconds;
  
  // 开始播放
  audioSource.start(startTime);
  console.log(`音频将在 ${delayInSeconds} 秒后播放`);
}

// 创建开始按钮
function checkAndCreateStartButton() {
  if (audioBuffer && isModelLoaded) {
    createStartButton();
  }
}

function createStartButton() {
  // 检查是否已经存在按钮
  if (document.getElementById('start-button')) {
    return;
  }
  
  const button = document.createElement('button');
  button.id = 'start-button';
  button.textContent = '点击开始动画和音乐';
  button.style.position = 'fixed';
  button.style.top = '20px';
  button.style.left = '50%';
  button.style.transform = 'translateX(-50%)';
  button.style.padding = '10px 20px';
  button.style.backgroundColor = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = '5px';
  button.style.cursor = 'pointer';
  button.style.zIndex = '1000';
  
  button.addEventListener('click', () => {
    // 恢复音频上下文
    audioContext.resume().then(() => {
      console.log('AudioContext 已恢复');
      
      // 开始动画
      if (mmdData) {
        const { mesh } = mmdData;
        helper.add(mesh, {
          animation: mmdData.animation,
        });
        
        scene.getScene().add(mesh);
        
        // 调整相机位置以便能看到模型全身
        camera.getCamera().position.set(0, 10, 15);
        camera.getCamera().lookAt(0, 10, 0);
        
        const frameRate = 30; // 帧率，根据实际情况调整
        const delayInSeconds = 86 / frameRate; // 延迟时间，smplh转vmd带来的问题
        
        // 播放音频
        playAudio(delayInSeconds);
        
        // 移除按钮
        button.remove();
      }
    });
  });
  
  document.body.appendChild(button);
}

export class Loader {
  loadModels() {
    const loader = new MMDLoader();

    loader.loadWithAnimation(
      "./assets/klee/可莉2.0.pmx", // called when the resource is loaded
      "./assets/animations/for_vmd.vmd",
      function onLoad(mmd) {
        // 保存模型数据，但不立即添加到场景
        mmdData = mmd;
        isModelLoaded = true;
        
        // 检查是否可以创建开始按钮
        checkAndCreateStartButton();
      }
    );

    // 移除了镜头动画加载部分，mocap应该将cam转成vmd，而music2dance的只能自己做cam轨迹
  }
}
export default new Loader();
//--------------------------------------------------------------------------------------------