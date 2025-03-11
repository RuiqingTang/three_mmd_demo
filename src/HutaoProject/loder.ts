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