import React from 'react';
import { Icon, List, Progress } from 'antd';

function ListItem(item, selected, setSelected) {
  const toggleItem = () => {
    if (!selected.includes(item.name)) {
      setSelected([...selected, item.name])
    } else {
      setSelected(selected.filter((el) => el !== item.name))
    }
  }

  return (
    <List.Item
      style={{
        cursor: 'pointer',
        background: selected.includes(item.name) ? '#72B6FF' : 'transparent',
      }}
      onClick={toggleItem}
    >
    <strong>{item.name}</strong> ({item.peers || 'n'} peers) - <Icon type="arrow-down" height="6" /> {item.downloadSpeed} Kb/s
    <Progress percent={item.progress} />
    <span>{item.downloaded}Mb of {item.total}Mb - </span>
    <span>{item.timeRemaining} remaining</span>
    </List.Item>
  );
}

export default ListItem;
