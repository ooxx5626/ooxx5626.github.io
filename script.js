/*
design by Voicu Apostol.
design: https://dribbble.com/shots/3533847-Mini-Music-Player
I can't find any open music api or mp3 api so i have to download all musics as mp3 file.
You can fork on github: https://github.com/muhammederdem/mini-player
*/
tag = document.location.hash.split("#")[1]
{
  if(tag){
    try{
      $.get( "./data/"+tag+".js", function( data ) {
        eval(data)
      });
    }catch{
      $.get( "./data/fullPlaylist.js", function( data ) {
        eval(data)
      });}
  }else{
    $.get( "./data/fullPlaylist.js", function( data ) {
      eval(data)
    });
  }
}

function m(x){
  r={}
  r["name"] = mapping[x]['title']
  r["source"] = "music/"+mapping[x]['id']+".mp3"
  r["cover"] = "thumbnail/"+mapping[x]['id']+".jpg"
  r["favorited"] = "False"
  r["artist"] =  ""
  return r
}
ntrackList = [{name:"",source:"",cover:"",favorited:"",artist:""}]
ntrackList = trackList.map(x =>m(x))

var vu = new Vue({
  el: "#app",
  data() {
    return {
      audio: null,
      circleLeft: null,
      barWidth: null,
      VolumebarWidth: null,
      volume: 0,
      duration: null,
      currentTime: null,
      isTimerPlaying: false,
      tracks: ntrackList,
      currentTrack: null,
      currentTrackIndex: 0,
      transitionName: null,
      settings: {
        maxLength: 100,
        length: 50,
        }
    };
  },
computed: {
    lengthThumbPosition: function() {
      volume = (( (this.settings.length) / (this.settings.maxLength)))
      // console.log(volume)
      this.audio.volume =volume  
      return volume*100;
    }
  },
  methods: {
    fetchVideoAndPlay() {
      try {
        var request = new XMLHttpRequest();
        request.open("GET", this.currentTrack.source, true);
        request.responseType = "blob"; 
        request.onload = function() {
          if (this.status == 200) {
            this.audio.src = URL.createObjectURL(this.response);
            this.audio.load();
            this.audio.play();
          }
        }
        request.send();
      } catch (error) {
        this.audio.src = this.currentTrack.source;
        this.audio.load();
        this.audio.play();

      }
    },
    play() {
      if (this.audio.paused) {
        this.updateAslide();
        // this.audio.play();
        this.fetchVideoAndPlay();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },
    generateTime() {
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = width + "%";
      this.circleLeft = width + "%";
      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration - durmin * 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime - curmin * 60);
      if (durmin < 10) {
        durmin = "0" + durmin;
      }
      if (dursec < 10) {
        dursec = "0" + dursec;
      }
      if (curmin < 10) {
        curmin = "0" + curmin;
      }
      if (cursec < 10) {
        cursec = "0" + cursec;
      }
      this.duration = durmin + ":" + dursec;
      this.currentTime = curmin + ":" + cursec;
    },
    updateBar(x) {
      let progress = this.$refs.progress;
      let maxduration = this.audio.duration;
      let position = x - progress.offsetLeft;
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      this.barWidth = percentage + "%";
      this.circleLeft = percentage + "%";
      this.audio.currentTime = (maxduration * percentage) / 100;
      this.audio.play();
    },
    clickProgress(e) {
      this.isTimerPlaying = true;
      this.audio.pause();
      this.updateBar(e.pageX);
    },
    clickVolumeProgress(e) {
      this.updateVolumeBar(e.pageX);
    },
    updateVolumeBar(x) {
      let progress = this.$refs.progress;
      // console.log("x: "+x);
      let position = x - progress.offsetLeft;
      // console.log("position: "+position);
      let percentage = (100 * position) / progress.offsetWidth;
      if (percentage > 100) {
        percentage = 100;
      }
      if (percentage < 0) {
        percentage = 0;
      }
      // console.log("percentage: "+percentage);
      // this.VolumebarWidth = percentage + "%";
    //   this.circleLeft = percentage + "%";
      this.audio.volume = percentage / 100;
    },
    prevTrack() {
      this.transitionName = "scale-in";
      this.isShowCover = false;
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
      } else {
        this.currentTrackIndex = this.tracks.length - 1;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    nextTrack() {
      this.transitionName = "scale-out";
      this.isShowCover = false;
      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.currentTrackIndex++;
      } else {
        this.currentTrackIndex = 0;
      }
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },
    specialTrack(index) {
      if(index>=0 && index < this.tracks.length){
        this.transitionName = "scale-out";
        this.isShowCover = false;
        this.currentTrackIndex = index
        this.currentTrack = this.tracks[this.currentTrackIndex];
        this.resetPlayer();
      }
    },
    updateAslide(){
      $("#bg-artwork")[0].style = "background-image: url('"+this.currentTrack.cover+"');"
      $('.plSel').removeClass('plSel');
      $('#plList li:eq(' + this.currentTrackIndex + ')').addClass('plSel');
    },
    resetPlayer() {
      this.barWidth = 0;
      this.circleLeft = 0;
      this.audio.currentTime = 0;
      // this.audio.src = this.currentTrack.source;
      // this.audio.load();
      if(this.isTimerPlaying) {
        this.updateAslide();
        // this.audio.play();
      this.fetchVideoAndPlay();
      } else {
        this.audio.pause();
      }
    },
    favorite() {
      this.tracks[this.currentTrackIndex].favorited = !this.tracks[
        this.currentTrackIndex
      ].favorited;
    },
    aslideList(){
        
      
      if(!$(".asideMenu.active").length){
        $(".asideMenu").toggleClass("active");
        $(".fa-chevron-right").toggleClass("rotate");
        setTimeout(()=>{$(".asideMenu")[0].style = 'display: none'}, 500);
      }else{
        $(".asideMenu")[0].style = 'display: block'
        
        setTimeout(()=>{
          $(".asideMenu").toggleClass("active");
          $(".fa-chevron-right").toggleClass("rotate");
        }, 10);
      }
    },
    handleClick () {
      const event = window.event || arguments[0]
      this.left = event.layerX
    },
    handleMouse() {
      const drag = this.$refs.drag
      const event = window.event || arguments[0]
      const origin = event.clientX - drag.offsetLeft
      const bar = this.$refs.bar
      bar.onmousemove = () => {
        const event = window.event || arguments[0]
        this.left = event.clientX - origin
        window.getSelection
          ? window.getSelection().removeAllRanges()
          : document.selection.empty()
      }
      bar.onmouseup = () => {
        const event = window.event || arguments[0]
        this.left = event.layerX
        bar.onmousemove = null
      }
    }
  },
  created() {
    let vm = this;
    this.currentTrack = this.tracks[0];
    this.audio = new Audio();
    this.audio.src = this.currentTrack.source;
    // $('#plList li:eq(' + this.currentTrackIndex + ')').addClass('plSel');
    this.audio.ontimeupdate = function() {
      vm.generateTime();
    };
    this.audio.onloadedmetadata = function() {
      vm.generateTime();
    };
    this.audio.onended = function() {
      vm.nextTrack();
      this.isTimerPlaying = true;
    };

    // this is optional (for preload covers)
    for (let index = 0; index < this.tracks.length; index++) {
      const element = this.tracks[index];
      let link = document.createElement('link');
      link.rel = "prefetch";
      link.href = element.cover;
      link.as = "image"
      // console.log(link)
      // console.log(element.cover)
      document.head.appendChild(link)
    }
  },

  mounted: function () {
      this.play,
      this.specialTrack,
      this.updateAslide
  }
});
  
  

//   var i = 0
//   $.each(trackList, function(key, value) {
//     var trackNumber = i,
//         trackName = value.name
//     i+=1
//     $('#plList').append('<li> \
//         <div class="plItem"> \
//             <span class="plNum">' + trackNumber + '.</span> \
//             <span class="plTitle">' + trackName + '</span> \
//         </div> \
//     </li>');
//   })
$('#plList li').on('click', function () { 
  var id = parseInt($(this).index());
  if (id !== vu.currentTrackIndex  ) {
    vu.specialTrack(id);
  }
})


// loadTrack = function (id) {
//   $('.plSel').removeClass('plSel');
//   $('#plList li:eq(' + id + ')').addClass('plSel');
//   npTitle.text(tracks[id].name);
//   index = id;
//   audio.src = mediaPath + tracks[id].file + extension;
//   updateDownload(id, audio.src);
// }
// updateDownload = function (id, source) {
//   player.on('loadedmetadata', function () {
//       $('a[data-plyr="download"]').attr('href', source);
//   });
// }
// playTrack = function (id) {
//   loadTrack(id);
//   audio.play();
// };