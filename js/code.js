//move all script into the script js folder and link it here later !!!!!!!!!!!!!!
const box = document.getElementById("typingBox");
//allowed letters for the soundboard (only a-z no special characterss)
const letters = "abcdefghijklmnopqrstuvwxyz";
//setting the website up for audio context and convolver for reverb effect
//https://developer.mozilla.org/en-US/docs/Web/API/AudioContext
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const convolver = audioCtx.createConvolver();
function createImpulse(seconds = 2){
    const rate = audioCtx.sampleRate;
    const length = rate * seconds;
    const impulse = audioCtx.createBuffer(2, length, rate);
    for(let i=0;i<2;i++){
        const channel = impulse.getChannelData(i);
        for(let j=0;j<length;j++){
            channel[j] = (Math.random()*2-1)*(1-j/length);
        }
    }
    return impulse;
}
convolver.buffer = createImpulse();
//loading all thr sounds I made into memory for quick access sounds are in the /sounds
const sounds = {};
letters.split('').forEach(letter => {
//fetching the sound files inputs the user inputed letter into the {letter} placeholder
    fetch(`sounds/${letter}.wav`)
        .then(r => r.arrayBuffer())
        .then(buf => audioCtx.decodeAudioData(buf))
        .then(decoded => sounds[letter] = decoded);
});
//the different fx levels,, might add a setting to change this later
let volumeLevel = 0.5;
let reverbLevel = 0;
let delayLevel = 0;
//making it so when using the period it loops the sentence
let currentSentence = "";
let loops = []; // {sentence, intervalId}
//background color changing based on the letter that is pressed
function colorFromLetter(letter){
    const index = letter.charCodeAt(0)-97;
    const hue = (index/26)*360;
    return `hsl(${hue}, 80%, 80%)`;
}

//adding the reverb, volume and delay changes based on the length of the words
//so like if "reverbbbbbb" lots of reveb but "reverb" no reverb and same for volume and delay 
//so just depedgn on the extra letters and length of th word
function extractLevel(word){
    const text = box.value.toLowerCase();
    const idx = text.lastIndexOf(word);
    if(idx===-1) return null;
    const rest = text.slice(idx+word.length).match(/^[a-z]+/);
    if(!rest) return 0;
    return Math.min(rest[0].length*0.1,1);
}
//playngn a single sound based on the letter pressed
function playSound(letter){
    const buffer = sounds[letter];
    if(!buffer) return;
//setting up the audio nodes for volume and reverb
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
//volume control
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volumeLevel;
//reverb control
    if(reverbLevel > 0){
        const wetGain = audioCtx.createGain();
        wetGain.gain.value = reverbLevel;
        const dryGain = audioCtx.createGain();
        dryGain.gain.value = 1 - reverbLevel;
//connecting the nodes together
        source.connect(gainNode);
        gainNode.connect(convolver);
        convolver.connect(wetGain);
        wetGain.connect(audioCtx.destination);
        gainNode.connect(dryGain);
        dryGain.connect(audioCtx.destination);
    } else {
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
    }
//starting the sound
    source.start();
}
//looping the sentnces when there is a period placed at the end
//will play int eh background until deleted from the box
function loopSentence(sentence){
    let i = 0;
    const interval = setInterval(()=>{
        if(i >= sentence.length) i = 0;
        const key = sentence[i].toLowerCase();
        if(letters.includes(key)) playSound(key);
        i++;
    }, 250);
    loops.push({sentence, intervalId: interval});
}
//keydown event listener to capture user input
document.addEventListener("keydown",(e)=>{
    const key = e.key;
//changing the fx based on the words typed
    const v = extractLevel("volume"); if(v!==null) volumeLevel=v;
    const r = extractLevel("reverb"); if(r!==null) reverbLevel=r;
    const d = extractLevel("delay"); if(d!==null) delayLevel=d;
//building the current sentence for looping
    if(key.length === 1 && key !== "Backspace") currentSentence += key;
//start looping the sentence when period is pressed
    if(key === "."){
        loopSentence(currentSentence);
        currentSentence = "";
    }
//stop looping when backspace is pressed and remove last character from current sentence
    if(key === "Backspace"){
        loops = loops.filter(loop=>{
            if(!box.value.includes(loop.sentence)){
                clearInterval(loop.intervalId);
                return false;
            }
            return true;
        });
        currentSentence = currentSentence.slice(0,-1);
    }
//playing the sound and changing background color when a letter is pressed
    if(letters.includes(key.toLowerCase())){
        playSound(key.toLowerCase());
        document.body.style.background = colorFromLetter(key.toLowerCase());
    }
});











//example card playing code
let isExamplePlaying = false;
let exampleAbort = false;
document.querySelectorAll('.play-btn').forEach(button => {
  button.addEventListener('click', async () => {
//stops if already playing
    if (isExamplePlaying) {
//telling the loop to stop or abort
      exampleAbort = true;   
      isExamplePlaying = false;
      button.textContent = "PLAY";
      return;
    }
//start playing when clicked
    const container = button.closest('.pixel-card');
    const text = container.querySelector('.example-text').textContent;
//making sure the sounds are loaded in before playing
    if (Object.keys(sounds).length < 26) {
      console.warn("Sounds are still loading!");
      return;
    }
    isExamplePlaying = true;
    exampleAbort = false;
    button.textContent = "STOP";
//plays the sounds by each letter
    for (const char of text) {
      if (exampleAbort) break;
//if aborted which is stop will stop
      const letter = char.toLowerCase();
//only plays the valid characters which is a-z
      if (letters.includes(letter)) {
        playSound(letter);
        await new Promise(r => setTimeout(r, 180));
      }
    }
//resets the button and state after finishing playing the example
    isExamplePlaying = false;
    button.textContent = "PLAY";
  });
});

