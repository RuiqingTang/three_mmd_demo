这个项目目前只是一个demo。

由于本人对TS和JS完全不懂，全靠claude和deepseek，所以开发进度缓慢。

# Roadmap

- 同步播放音乐和vmd动画（已实现）

- 文本/语音交互

  ASR——LLM Role Play（Prompts / SFT）——TTS，三个都很简单，并且我都已经实现了，但是怎么接入是个问题

- music2dance

  现在播放的vmd就是根据bgm生成的，但是滑步还很严重，生成的smpl数据其实还好，但是转换vmd的时候，没有ik骨骼，滑步就很严重。

- text2motion

  算法已经实现了，但是导出的bvh不是smpl的骨骼，对mmd_tools_helper和mmd_tools插件做了二次开发，但是转vmd的时候日语乱码，还没处理好。虽然有替代的算法，可以转成vmd，当然也会有和music2dance类似的滑步问题，但是主要是生成的动作和文本匹配度不够高，并且延迟很高，体验很不好。

  

