import React from 'react';
import ReactPlayer from 'react-player'
import * as screenfull from 'screenfull';
import { Screenfull } from 'screenfull';
import { theme, Hide, Inline } from 'components';
import { Slider, Text, IconButton, Stack, IStackStyles, Layer, LayerHost } from 'office-ui-fabric-react';
// import { Depths } from '@uifabric/fluent-theme';

interface IVideoPlayerProps {
  name?: string;
  path?: string;
}

export class VideoPlayerControlls extends React.Component {
  public render() {
    return <LayerHost id='VideoPlayerControllsLayer'/>
  }
}

export class VideoPlayer extends React.Component<IVideoPlayerProps> {
  public render() {
    return (
      <ReactPlayer url={this.props.path} controls={true} height={'100%'} width={'100%'} style={{ borderTop: '1px solid ' + theme.palette.neutralLight }}
      config={{ file: { 
        attributes: {
          onContextMenu: e => e.preventDefault(),
          controlsList: 'nodownload noremoteplayback',
          disablepictureinpicture: 'true'
        }
      }}}
      />
    );
  }
}

function Duration ({ seconds }) {
  return (
    <Text variant='mediumPlus'>
      <time dateTime={`P${Math.round(seconds)}S`}>
        {format(seconds)}
      </time>
    </Text>
  )
}

function format (seconds) {
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = pad(date.getUTCSeconds())
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`
  }
  return `${mm}:${ss}`
}

function pad (string) {
  return ('0' + string).slice(-2)
}


export class CustomVideoPlayer extends React.Component<IVideoPlayerProps> {

  state = {
    url: null,
    pip: false,
    playing: false,
    controls: false,
    light: false,
    volume: 0.8,
    volumeLast: 0.8,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
    seeking: false,
    volumechanging: false,
    fullscreen: false,
  }
/*
  private player: React.RefObject<any>;
  constructor(props) {
    super(props);
    this.player = React.createRef();
  }
*/
  load = url => {
    this.setState({
      url,
      playing: false,
      played: 0,
      loaded: 0,
      pip: false
    })
  }

  handlePlayPause = () => {
    this.setState({ playing: !this.state.playing })
  }

  handleStop = () => {
    this.setState({ url: null, playing: false })
  }

  handleToggleControls = () => {
    const url = this.state.url
    this.setState({
      controls: !this.state.controls,
      url: null
    }, () => this.load(url))
  }

  handleToggleLight = () => {
    this.setState({ light: !this.state.light })
  }

  handleToggleLoop = () => {
    this.setState({ loop: !this.state.loop })
  }

  handleVolumeChange = e => {
    this.setState({ volume: parseFloat(e.target.value) })
  }

  handleToggleMuted = () => {
    this.setState({ muted: !this.state.muted, volumeLast: this.state.volume, volume: this.state.muted ? this.state.volumeLast : 0 })
  }

  handleSetPlaybackRate = e => {
    this.setState({ playbackRate: parseFloat(e.target.value) })
  }

  handleTogglePIP = () => {
    this.setState({ pip: !this.state.pip })
  }

  handlePlay = () => {
    //console.log('onPlay')
    this.setState({ playing: true })
  }

  handleEnablePIP = () => {
    //console.log('onEnablePIP')
    this.setState({ pip: true })
  }

  handleDisablePIP = () => {
    //console.log('onDisablePIP')
    this.setState({ pip: false })
  }

  handlePause = () => {
    //console.log('onPause')
    this.setState({ playing: false })
  }

  handleSeekMouseDown = e => {
    this.setState({ seeking: true })
  }

  handleSeekChange = e => {
    this.setState({ played: parseFloat(e.target.value) })
  }

  private player = React.createRef<ReactPlayer>();
  
  handleSeekMouseUp = e => {
    this.setState({ seeking: false })
    if (this.player.current)
    this.player.current.seekTo(parseFloat(e.target.value))
  }

  handleProgress = state => {
    //console.log('onProgress', state)
    // We only want to update time slider if we are not currently seeking
    if (!this.state.seeking) {
      this.setState(state)
    }
  }

  handleEnded = () => {
    //console.log('onEnded')
    this.setState({ playing: this.state.loop })
  }

  handleDuration = (duration) => {
    //console.log('onDuration', duration)
    this.setState({ duration })
  }

  handleClickFullscreen = () => {
    const element = document.getElementById('player-main');
    if (screenfull.isEnabled && element) {
      // screenfull.request(findDOMNode(this.player))
      screenfull.request(element);
    }
  }

  handleClickFullscreenExit = () => {
    if (screenfull.isEnabled) {
      screenfull.exit();
    }
  }

  renderLoadButton = (url, label) => {
    return (
      <button onClick={() => this.load(url)}>
        {label}
      </button>
    )
  }



/*
  ref = player => {
    this.player = player
  }
*/
  public componentDidUpdate(prevProps: IVideoPlayerProps) {
    if (prevProps.path !== this.props.path) {
      this.setState({ playing: false, duration: 0, played: 0 })
    }
  }

  public componentDidMount() {
    if (screenfull.isEnabled) {
      screenfull.on('change', () => {
        this.setState({ fullscreen: (screenfull as Screenfull).isFullscreen })
      });
    }
  }

  render () {

 
    
    const { /*url,*/ playing, /*controls,*/ light, volume, muted, loop, played, /*loaded,*/ duration, playbackRate, /*pip*/ } = this.state

    /*
    const containerStackStyle:IStackStyles = {
      root: {
        flexShrink: '0!important',
        width: '100%',
        borderTop: '1px solid ' + theme.palette.neutralLight,
        borderRight: '1px solid ' + theme.palette.neutralLight,
        height: 'calc(100% - 1px)',
        boxShadow: Depths.depth16,
      //  alignSelf: 'flex-start',
      }
    }
    const editorStackStyle:IStackStyles = {
      root: {
        flexShrink: '0!important',
        height: 'calc(100% - 51px)',
        flex: 'auto',
      //  alignSelf: 'flex-start',
      }
    }
*/
    const commandsStackStyle:IStackStyles = {
      root: {
        flexShrink: '0!important',
        height: '50px',
      }
    }

    /*
    
 

      <div style={{ width: '100%', borderTop: '1px solid ' + theme.palette.neutralLight }}>
          <Inline>
            <IconButton
              title={!playing ? 'Воспроизвести' : 'Приостановить'}
              iconProps={{ iconName: !playing ? 'icon-play' : 'icon-pause'}}
              onClick={()=>  this.setState({ playing: !this.state.playing })}
            />
            <Slider min={0} max={0.999999} value={played} showValue={false} step={0.000001}
              onChange={(value: number) => { 
                if (this.state.seeking === false) this.setState({ seeking: true });
                this.setState({ played: value });
              }}
              onChanged={(event: MouseEvent | TouchEvent | KeyboardEvent, value: number) => {
                this.setState({ seeking: false });
                if (this.player.current) this.player.current.seekTo(value);
              }}
              styles={{root: {width: '50%', paddingTop: '2px'}}}
            />
            <div style={{ paddingTop: '5px' }}>
              <Duration seconds={duration * played}/>&nbsp;/&nbsp;<Duration seconds={duration}/>
            </div>
            <IconButton
              title={!muted ? 'Отключить звук' : 'Включить звук'}
              iconProps={{ iconName: !muted ? 'icon-volume-2' : 'icon-volume-x'}}
              onClick={()=>  this.setState({ muted: !this.state.muted })}
            />
            <Slider min={0} max={1} value={volume} showValue={false} step={0.01}
              onChange={(value: number) => { 
                this.setState({ volume: value })
              }}
             
              styles={{root: {width: '15%', paddingTop: '2px'}}}
            />
          </Inline>
      </div>   
     */
    /*
    const commands = [
      {
        disabled: this.props.path === undefined,
        icononOnly: true,
        key: 'playing',
        // name: !playing ? 'Воспроизвести' : 'Приостановить',
        iconProps: { iconName: !playing ? 'icon-play' : 'icon-pause' },
        onClick: () => this.setState({ playing: !this.state.playing }),
      },
      {
        key:"seeking",
        onRender:() =>  <Slider min={0} max={0.999999} value={played} showValue={false} step={0.000001}
        disabled={this.props.path === undefined}
                    onChange={(value: number) => { 
                      if (this.state.seeking === false) this.setState({ seeking: true });
                      this.setState({ played: value });
                    }}
                    onChanged={(event: MouseEvent | TouchEvent | KeyboardEvent, value: number) => {
                      this.setState({ seeking: false });
                      if (this.player.current) this.player.current.seekTo(value);
                    }}
                    styles={{root: {width: '500px', paddingTop: '2px'}}}
                  />
       
      },
      {
        key:"played",
        onRender:() =>  <div style={{ paddingTop: '5px' }}>
        <Duration seconds={duration * played}/>&nbsp;/&nbsp;<Duration seconds={duration}/>
      </div>

      },
      {
        disabled: this.props.path === undefined,
        icononOnly: true,
        key: 'muted',
        // name: !muted ? 'Отключить звук' : 'Включить звук',
        iconProps: { iconName: !muted ? 'icon-volume-2' : 'icon-volume-x' },
        onClick: () => this.setState({ muted: !this.state.muted }),
      }, 
      {
        key:"volume",
        onRender:() => <Slider min={0} max={1} value={volume} showValue={false} step={0.01}
        disabled={this.props.path === undefined}
        onChange={(value: number) => { 
          this.setState({ volume: value })
        }}
       
        styles={{root: {width: '150px', paddingTop: '2px'}}}
      />

      }  
    ];
*/

    return (
      <div className='player-container'>
         <Layer hostId='VideoPlayerControllsLayer'>
        <Stack styles={commandsStackStyle}>
       
          <Stack.Item align="center">
          
          <Inline>
            <IconButton
             disabled={this.props.path === undefined}
              title={!playing ? 'Воспроизвести' : 'Приостановить'}
              iconProps={{ iconName: !playing ? 'icon-play' : 'icon-pause'}}
              onClick={()=>  this.setState({ playing: !this.state.playing })}
            />
            <Slider min={0} max={0.999999} value={played} showValue={false} step={0.000001}
             disabled={this.props.path === undefined}
              onChange={(value: number) => { 
                if (this.state.seeking === false) this.setState({ seeking: true });
                this.setState({ played: value });
              }}
              onChanged={(event: MouseEvent | TouchEvent | KeyboardEvent, value: number) => {
                this.setState({ seeking: false });
                if (this.player.current) this.player.current.seekTo(value);
              }}
              styles={{root: {width: '500px', paddingTop: '2px'}}}
            />
            <div style={{ paddingTop: '5px' }}>
              <Duration seconds={duration * played}/>&nbsp;/&nbsp;<Duration seconds={duration}/>
            </div>
            <IconButton
              disabled={this.props.path === undefined}
              title={!muted ? 'Отключить звук' : 'Включить звук'}
              iconProps={{ iconName: volume === 0 ? 'icon-volume-x' : volume < 0.3 ? 'icon-volume' : volume < 0.7 ? 'icon-volume-1' : 'icon-volume-2'}}
              onClick={()=>  this.setState({ muted: !this.state.muted, volumeLast: this.state.volume, volume: this.state.muted ? this.state.volumeLast : 0 })}
            />
            <Slider min={0} max={1} value={volume} showValue={false} step={0.01}
             disabled={this.props.path === undefined}
              onChange={(value: number) => {
                if (this.state.volumechanging === false) this.setState({ volumeLast: this.state.volume, volumechanging: true });
                this.setState({ volume: value,  })
              }}
              onChanged={(event: MouseEvent | TouchEvent | KeyboardEvent, value: number) => {

                this.setState({ volumechanging: false, muted: value > 0 ? false : true })
              }}
              styles={{root: {width: '150px', paddingTop: '2px'}}}
            />

<IconButton
           disabled={this.props.path === undefined}
           title={'На полный экран'}
           iconProps={{ iconName: 'icon-maximize'}}
           onClick={() => this.handleClickFullscreen()}
         />

          </Inline>
          
              </Stack.Item>
              
        </Stack>
        </Layer>
   
          <div id='player-main'>

<Hide condition={!this.state.fullscreen}>
          <div id='player-controls' style={{
            position: 'absolute',
            width: '80%',
            bottom: '20px',
            zIndex: 2000,
          }}>
          
          <Stack styles={commandsStackStyle}>
       
       <Stack.Item align="center">
       
       <Inline>
         <IconButton
          disabled={this.props.path === undefined}
           title={!playing ? 'Воспроизвести' : 'Приостановить'}
           iconProps={{ iconName: !playing ? 'icon-play' : 'icon-pause'}}
           onClick={()=>  this.setState({ playing: !this.state.playing })}
         />
         <Slider min={0} max={0.999999} value={played} showValue={false} step={0.000001}
          disabled={this.props.path === undefined}
           onChange={(value: number) => { 
             if (this.state.seeking === false) this.setState({ seeking: true });
             this.setState({ played: value });
           }}
           onChanged={(event: MouseEvent | TouchEvent | KeyboardEvent, value: number) => {
             this.setState({ seeking: false });
             if (this.player.current) this.player.current.seekTo(value);
           }}
           styles={{root: {width: '500px', paddingTop: '2px'}}}
         />
         <div style={{ paddingTop: '5px' }}>
           <Duration seconds={duration * played}/>&nbsp;/&nbsp;<Duration seconds={duration}/>
         </div>
         <IconButton
           disabled={this.props.path === undefined}
           title={!muted ? 'Отключить звук' : 'Включить звук'}
           iconProps={{ iconName: volume === 0 ? 'icon-volume-x' : volume < 0.3 ? 'icon-volume' : volume < 0.7 ? 'icon-volume-1' : 'icon-volume-2'}}
           onClick={()=>  this.setState({ muted: !this.state.muted, volumeLast: this.state.volume, volume: this.state.muted ? this.state.volumeLast : 0 })}
         />
         <Slider min={0} max={1} value={volume} showValue={false} step={0.01}
          disabled={this.props.path === undefined}
           onChange={(value: number) => {
             if (this.state.volumechanging === false) this.setState({ volumeLast: this.state.volume, volumechanging: true });
             this.setState({ volume: value,  })
           }}
           onChanged={(event: MouseEvent | TouchEvent | KeyboardEvent, value: number) => {
             this.setState({ volumechanging: false, muted: value > 0 ? false : true })
           }}
           styles={{root: {width: '150px', paddingTop: '2px'}}}
         />
       
       <IconButton
           disabled={this.props.path === undefined}
           title={'Выйти из полного экрана'}
           iconProps={{ iconName: 'icon-minimize'}}
           onClick={() => this.handleClickFullscreenExit()}
         />


       </Inline>
       
           </Stack.Item>
           
     </Stack>
</div>
</Hide>
            <ReactPlayer
              ref={this.player}
              style={{
                borderTop: this.state.fullscreen ? 'none' : '1px solid ' + theme.palette.neutralLight,
                alignSelf: 'flex-start',
                display: 'flex',
                height:'inherit!important',
                outline: 'none',
              }}
              width='100%'
              height='100%'
              url={this.props.path}
              pip={false}
              playing={playing}
              controls={false}
              light={light}
              loop={loop}
              playbackRate={playbackRate}
              volume={volume}
              muted={muted}
              onPlay={this.handlePlay}
              //onEnablePIP={this.handleEnablePIP}
              //onDisablePIP={this.handleDisablePIP}
              onPause={this.handlePause}
              onEnded={this.handleEnded}
              onError={e => console.log('onError', e)}
              onProgress={this.handleProgress}
              onDuration={this.handleDuration}
              config={{ file: { 
                attributes: {
                  onContextMenu: e => e.preventDefault(),
                  controlsList: 'nodownload noremoteplayback',
                  disablePictureInPicture: true
                }
              }}}
            />
          </div>
      
      </div>

    )
  }
}
