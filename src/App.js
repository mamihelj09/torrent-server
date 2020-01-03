import React from 'react';
import { Button, Icon, List, notification, PageHeader } from 'antd';
import io from 'socket.io-client';

import AddFileModal from './AddFileModal';
import ListItem from './ListItem';
// import { KODI_IP } from '../config';

const socketIo = io(`${process.env.NODE_ENV === 'development' ? 'localhost' : 'http://192.168.0.105'}:9091`);

function App() {
  const [formRef, setFormRef] = React.useState(null);
  const [isShown, toggleShowModal] = React.useState(false);
  const [selected, setSelected] = React.useState([]);
  const [torrents, setTorrents] = React.useState([]);

  React.useEffect(() => {
    socketIo.on('connect', () => {
      socketIo.on('torrent', ({data}) => setTorrents(data));
      socketIo.on('done', ({data}) => notification.success({message: `DOWNLOAD DONE ${data}`, duration: null}));
    });
  }, []);

  const handleAddFile = () => {
    formRef.validateFields((err, values) => {
      if (err) {
        return;
      }

      socketIo.emit('new', {data: {
        ...values,
        folder: values.folder.split(' ').join('.'),
      }})
      toggleShowModal(false);
    })
  }

  const saveFormRef = React.useCallback(node => {
    if (node !== null) {
      setFormRef(node);
    }
  }, []);

  return (
    <>
      <AddFileModal
        onCancel={() => toggleShowModal(false)}
        onCreate={handleAddFile}
        visible={isShown}
        ref={saveFormRef}
      />
     <PageHeader
        style={{border: '1px solid rgb(235, 237, 240)',}}
        title="Home Torrent Box"
        extra={[
          <Button key="1" onClick={() => toggleShowModal(true)}>
            <Icon type="file-add" />
          </Button>,
          <Button key="4" onClick={() => selected.forEach((uri) => {
            console.log(uri);
            socketIo.send('delete', {uri})
          })}>
            <Icon type="delete" />
          </Button>,
        ]}
      />
      <List
        size="large"
        bordered
        style={{paddinhRight: '10px'}}
        dataSource={torrents.filter((item) => item.progress !== null)}
        renderItem={(item) => ListItem(item, selected, setSelected)}
      />
    </>
  );
}

export default App;
