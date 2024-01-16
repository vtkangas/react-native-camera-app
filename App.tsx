import React, { useRef, useState } from 'react';
import { Provider, Appbar, IconButton, FAB, Dialog, Portal, Button  } from 'react-native-paper';
import { StyleSheet, Text, TextInput, View, Image } from 'react-native';
import { Camera, PermissionResponse, CameraCapturedPicture } from 'expo-camera';

interface CameraInfo {
  shootingMode : boolean
  error : string
  capturedPic? : CameraCapturedPicture
  picName : string
  info : string
}

const App: React.FC = () : React.ReactElement => {
  
  const camRef : any = useRef<Camera>();
  const textRef : React.MutableRefObject<any> = useRef<TextInput>();
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [cameraInfo, setCameraInfo] = useState<CameraInfo>({
                                                            shootingMode : false,
                                                            error : "",
                                                            picName : "",
                                                            info : ""
                                                          });
    
  const startCamera = async () : Promise<void> => {

    const cameraPermission : PermissionResponse = await Camera.requestCameraPermissionsAsync()

    setCameraInfo({
      ...cameraInfo,
      shootingMode : cameraPermission.granted,
      info : "",
      error : (!cameraPermission.granted) ? "Ei lupaa kameran käyttöön" : ""
    })
  }

  const takePic = async () : Promise<void> => {

    setCameraInfo({
      ...cameraInfo,
      info : "Odota hetki..."
    })

    const photo : CameraCapturedPicture = await camRef.current.takePictureAsync()

    setCameraInfo({
      ...cameraInfo,
      shootingMode : false,
      capturedPic : photo,
      info : ""
    });

    setDialogVisible(true)

  }

  const nameThePicture = () => {

    setCameraInfo({
      ...cameraInfo,
      picName : textRef.current.value
    })

    textRef.current.clear();
    setDialogVisible(false);

  }

  const sendPic = async () : Promise<void> => {
        
    const formData = new FormData();

      formData.append("file", {
        uri: cameraInfo.capturedPic!.uri, 
        type: 'image/jpeg',
        name: `${cameraInfo.picName}.jpg`
      } as any)
    
    await fetch(

			`http://192.168.43.100:3103/upload`,

			{
				method: 'POST',
				body: formData
			}

		)

			.then((response) => response.json() )
			.then((result) => {

				console.log(result);

        if (result.ok){

          setCameraInfo({
            shootingMode : false,
            error : "",
            picName : "",
            info : ""
          });

        } else {

          throw new Error(result.error);

        }

			})

			.catch((error) => {

				console.error('Error:', error);
        
			});

  }


  return (
    
    (cameraInfo.shootingMode)
    ?<Camera 
      style={styles.cameraView} 
      ref={camRef}
      >

        {(Boolean(cameraInfo.info))
          ? <Text style={{color: "#fff"}}>{cameraInfo.info}</Text>
          : null
        }    

        <FAB 
          style={styles.buttonTakePic}
          icon="camera"
          label="Ota kuva"
          onPress={() => takePic()}
        />

        <FAB 
          style={styles.buttonClose}
          icon="close"
          label="Peruuta"
          small
          onPress={ () => setCameraInfo({...cameraInfo, shootingMode: false})}
        />

    </Camera>
    :<Provider>

      <Appbar.Header style={styles.header}>
        <Appbar.Content color="#fff" title="Ot3" />
        <Appbar.Action 
          icon="camera" 
          iconColor="#fff"
          onPress={startCamera} />
      </Appbar.Header>
      
      <View style={styles.container}>

        <Portal>
          <Dialog visible={dialogVisible}>
            <Dialog.Title>Anna nimi</Dialog.Title>
            <Dialog.Content>
              <TextInput 
                ref={textRef}
                placeholder="Name"
                onChangeText={ (text : string) => textRef.current.value = text}/>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={nameThePicture}>Valmis</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {(Boolean(cameraInfo.error))
          ? <Text>{cameraInfo.error}</Text>
          : null
        } 

        {(Boolean(cameraInfo.capturedPic))
          ? <>
            <Text>{cameraInfo.picName}</Text>
            <Image
              style={styles.image}
              source={{ uri : cameraInfo.capturedPic!.uri }}
            />
            <FAB 
              style={styles.buttonSend}
              icon="send"
              label="Lähetä palvelimelle"
              onPress={sendPic}
              />
            </>
          : null
        }
        
      </View>

    </Provider>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#86A397',
    textColor: '#fff'
  },
  cameraView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonClose: {
    position: 'absolute',
    margin: 20,
    bottom: 0,
    right: 0,
  },
  buttonTakePic: {
    position: 'absolute',
    margin: 20,
    bottom: 0,
    left: 0,
  },
  buttonSend: {
    position: 'absolute',
    margin: 'auto',
    bottom: 20,
  },
  image: {
    width: 300,
    height: 400,
    resizeMode: 'contain'
  },
  error: {
    color: 'red',
    position: 'absolute',
    margin: 'auto'
  }
});

export default App;