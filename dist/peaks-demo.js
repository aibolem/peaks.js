(function(Peaks){
  var audiography = {
    audioElement: document.querySelector('#audio-element'), 
    currentSegmentToAdd: '', 
    playAudio: function(){
      if(audiography.audioElement.paused){
        audiography.audioElement.play()
      }
    }, 
    pauseAudio: function(){
      if(!audiography.audioElement.paused){
        audiography.audioElement.pause()
      }
    }, 
    seekAudioForward: function(){
      console.log('clicked')
      console.log(audiography.audioElement.duration)
      audiography.audioElement.currentTime = (audiography.audioElement.currentTime + (audiography.audioElement.duration / 10))
      console.log(audiography.audioElement.currentTime); 
    }, 
    seekAudioBackward: function(){
      audiography.audioElement.currentTime = (audiography.audioElement.currentTime - (audiography.audioElement.duration / 10))
    }
  }

  var p = Peaks.init({
  	container: document.querySelector('#waveform-container'), 
  	mediaElement: audiography.audioElement, 
  	dataUri: {
  		json: 'sonata.json'
  	}, 
    zoomLevels: [512, 1024, 2048, 4096], 
    segments: [
        {
          startTime: 1.3, 
          endTime: 242, 
          id: 'sotto voce', 
          labelText: "The first theme is a descending scale marked sotto voce; full of ominous undertow, it reappears at crucial points in the work's structure. This leads immediately to a jagged, forceful theme in octaves. This is quickly followed by a hammering marcato idea in the left hand. A dialogue ensues, with mounting energy, until reaching the noble grandiose second subject in D major. Liszt transforms the left-hand theme into a lyrical melody of exquisite loveliness.", 
          editable: false
        }, 
        {
          startTime: 649, 
          endTime: 1030, 
          id: 'Andante sostenuto', 
          labelText: "The slow movement, an Andante sostenuto of haunting beauty, is the centerpiece of the sonata.", 
          editable: false
        }, 
        {
          startTime: 1325, 
          endTime: 1495, 
          id: 'fugato', 
          labelText: "The final recapitulatory section is launched by a driving fugato of contrapuntal skill which leads to the compressed return of the opening material. Calling upon every intellectual resource and fully exploiting the pianist's technical arsenal, it is at this point where a performer's concentration might flag. But this final section has only just begun, and a pianist needs to have reserved fuel in his tank if he is to turn in a successful performance of the sonata", 
          editable: false
        }
    ]

  });

  p.on('segments.ready', function(){


    var segmentsList = new Vue({
      el:'#segments-list', 
      data: {
        segments: p.segments.getSegments(),
        currentTime: 0
      }, 
      methods: {
        seekToSegment: function(segment){
          console.log(segment)
          p.time.setCurrentTime(parseFloat(segment.startTime)); 
        }
      }
    })


    //This listener keeps track of the current time in the Vue VM 
    //so that we can display active segments as they become active
    audiography.audioElement.addEventListener('timeupdate', function(){
      segmentsList.currentTime = p.time.getCurrentTime(); 
    })

    //hook up custom audio controls to UI
    document.querySelector('#zoom-out-button').addEventListener('click', p.zoom.zoomOut)
    document.querySelector('#zoom-in-button').addEventListener('click', p.zoom.zoomIn)
    document.querySelector('#seek-forward-button').addEventListener('click', audiography.seekAudioForward)
    document.querySelector('#seek-backward-button').addEventListener('click', audiography.seekAudioBackward)
    document.querySelector('#play-button').addEventListener('click', audiography.playAudio)
    document.querySelector('#pause-button').addEventListener('click', audiography.pauseAudio)


    document.querySelector('#add-segment').addEventListener('click', function(){
      //get textbox values 
      var segmentId = document.querySelector('#segment-name').value; 
      var segmentLabel = document.querySelector('#segment-description').value; 

      //create default start and end times for editable new segment
      var currentTime = p.time.getCurrentTime();
      var endTime = currentTime + 60; 

      //create segment option
      var newSegment = {
        startTime: currentTime, 
        endTime: endTime, 
        editable: true, 
        id: segmentId, 
        labelText: segmentLabel
      }

      //add to waveform for user to edit 
      p.segments.add(newSegment); 

      //add to audiography object to keep track of ID
      audiography.currentSegmentToAdd = segmentId; 

      this.setAttribute('disabled', 'disabled'); 
      document.querySelector('#save-segment').removeAttribute('disabled'); 

    })


    document.querySelector('#save-segment').addEventListener('click', function(){

      var segmentIdToRemove = audiography.currentSegmentToAdd; 
      
      //reset textbox values 
      document.querySelector('#segment-name').value = ''; 
      document.querySelector('#segment-description').value = ''; 


      var segmentToSave = p.segments.getSegments().filter(function(segment){
          return segment.id === segmentIdToRemove; 
      })[0]

      console.log(segmentToSave); 
      p.segments.removeById(segmentToSave.id); 
      segmentToSave.editable = false; 
      p.segments.add(segmentToSave); 

      this.setAttribute('disabled', 'disabled'); 
      document.querySelector('#add-segment').removeAttribute('disabled'); 

    }); 

  
  })




})(peaks)
