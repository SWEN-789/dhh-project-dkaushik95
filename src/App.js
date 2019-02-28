import React, { Component } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import './library/dictate'

export default class App extends Component {
  constructor(){
    super()
    this.state = {
      serverStatus: null,
      event: null,
      transcription: '',
      partial: '',
      error: null,
      status: {
        initialized: false,
        startedRecording: false,
        stoppedRecording: false
      },
      showEndActions: false,
      copied: false
    }
    console.log(window.Dictate)
    this.dictate = new window.Dictate({
      server: "ws://localhost:8080/client/ws/speech",
      serverStatus: "ws://localhost:8080/client/ws/status",
      // server : "wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/speech",
      // serverStatus : "wss://bark.phon.ioc.ee:8443/dev/duplex-speech-api/ws/status",
      recorderWorkerPath : '/recorderWorker.js',
      onReadyForSpeech : this.onReadyForSpeech,
      onEndOfSpeech : this.onEndOfSpeech,
      onEndOfSession : this.onEndOfSession,
      onServerStatus : this.onServerStatus,
      onPartialResults : this.onPartialResults,
      onResults : this.onResults,
      onError : this.onError,
      onEvent : this.onEvent
    });
  }

  onReadyForSpeech = () => {
    console.log('Ready for speech')
  }

  onEndOfSpeech = () => {
    console.log('Speech Ended')
  }

  onEndOfSession = () => {
    this.onEvent(3, 'Session Ended')
    // console.log('Session Ended')
  }

  onServerStatus = (json) => {
    this.setState({
      serverStatus: {
        num_workers_available: json.num_workers_available,
        num_requests_processed: json.num_requests_processed
      }
    }, () => {
      setTimeout(() => {
        this.setState({
          serverStatus: null
        })
      }, 2000)
    }) 
    console.log('Server Status ', json)
  }

  onPartialResults = (hypos) => {
    console.log('Partial result ', hypos)
    let transcript = ''
    for(let i in hypos){
      transcript += hypos[i].transcript
    }
    this.setState({
      partial: this.state.transcription + transcript
    })
  }

  onResults = (hypos) => {
    console.log('Result ', hypos)
    this.setState({
      transcription: this.state.transcription + hypos[0].transcript,
      partial: ''
    })
  }

  onError = (code, data) => {
    this.setState({
      error: data
    }, () => {
      setTimeout(() => {
        this.setState({
          error: null
        })
      }, 2000)
    })
  }

  onEvent = (code, data) => {
    if(code === 5){
      return
    }
    this.setState({
      event: data
    }, () => {
      setTimeout(() => {
        this.setState({
          event: null
        })
      }, 2000);
    }) 
    // console.log('Event Code', code)
    // console.log('Event data', data)
  }

  initialize = () => {
    this.dictate.init();
    this.setState({
      status: {
        initialized: true,
        startedRecording: false,
        stoppedRecording: false
      }
    })
  }

  startRecording = () => {
    this.dictate.startListening()
    this.setState({
      status: {
        initialized: true,
        startedRecording: true,
        stoppedRecording: true
      },
      showEndActions: false,
      copied: false
    })
  }

  stopRecording = () => {
    this.dictate.stopListening()
    this.setState({
      status: {
        initialized: true,
        startedRecording: false,
        stoppedRecording: false
      },
      showEndActions: true
    })
  }

  downloadTranscript = () => {
    var element = document.createElement('a')
    var file = new Blob(['FINAL\n' + this.state.transcription + '\nNot final\n' + this.state.partial], {type: 'text/plain'})
    element.href=URL.createObjectURL(file)
    element.download = 'transcript' + Date.now()
    element.click()
  }

  copyToClipboard = () => {
    this.setState({
      copied: true
    })
  }

  render() {
    return (
      <div className="container-fluid">
        <nav className="navbar navbar-expand-md navbar-light bg-light">
          <a className="navbar-brand white" href="#">Meetings</a>
          <button className="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#collapsibleNavId" aria-controls="collapsibleNavId"
              aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
        </nav>
        {!this.state.showEndActions ? (
          <div className="row">
            <div className='col-12'>
              <small>Transcript</small>
              {this.state.transcription || this.state.partial ? (
                <div style={{height: '70vh'}}>
                  <p>
                    <span>{this.state.transcription}</span>
                    <span style={{color: 'grey'}}>{this.state.partial}</span>
                  </p>
                </div>
              ) : (
                <div style={{height: '50vh'}}></div>
              )}
            </div>
          </div>
        ) : (<div></div>)}

        
        <div className='row' style={{minHeight: '20vh'}}>
          <div className='col'>
            {this.state.event ? (
                <div className='alert alert-primary'>
                  New Event: { "" + this.state.event}
                </div>
              ) : (
                <div></div>
              )}

              {this.state.serverStatus ? (
                <div className='alert alert-success'>
                  Server Status: 
                    <p>Number of Requests: {this.state.serverStatus.num_requests_processed}</p>
                    <p>Workers available: {this.state.serverStatus.num_workers_available}</p>
                </div>
              ) : (
                <div></div>
              )}
              
              {this.state.error ? (
                <div className='alert alert-danger'>
                  Error: {this.state.error}
                </div>
              ) : (
                <div></div>
              )}

              {this.state.showEndActions ? (
                  <div className='col-12' style={{marginBottom: '100px'}}>
                    <h1>I hope you had a good meeting</h1>
                    <p>Would you like to save or copy the transcript?</p>
                    <div style={{width: '100%', justifyContent: 'space-between'}}>
                      <button onClick={this.downloadTranscript} className='btn btn-primary'>Save</button>
                      <CopyToClipboard text={this.state.transcription + '\n' + this.state.partial} onCopy={this.copyToClipboard}>
                        <button className={this.state.copied ? 'btn btn-success' : 'btn btn-primary'}>Copy to Clipboard</button>
                      </CopyToClipboard>
                    </div>
                  </div>
                ) : (
                  <div></div>
              )}
          </div>
        </div>

        <div className='row fixed-bottom' style={{padding: 15, background: 'white', borderTop: '1px solid grey'}}>
              <div className='col-4 d-md-flex justify-content-md-center align-items-md-center' >
              <button className={this.state.status.initialized ? 'btn btn-success': 'btn btn-primary'} onClick={this.initialize}>Initialize the microphone</button>
              </div>
              <div className='col-4 d-md-flex justify-content-md-center align-items-md-center' >
                <button className={this.state.status.startedRecording ? 'btn btn-primary': 'btn btn-success'} onClick={this.startRecording}>Start Recording</button>
              </div>
              <div className='col-4 d-md-flex justify-content-md-center align-items-md-center' >
                <button className={this.state.status.stoppedRecording ? 'btn btn-danger': 'btn btn-primary'} onClick={this.stopRecording}>Stop Recording</button>
              </div>
        </div>    
      </div>
    )
  }
}