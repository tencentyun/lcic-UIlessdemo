import { useContext, useState } from 'react';
import style from './style.module.css';
import { BootContext } from '../../../../../contexts/boot.context';
import { SettingList } from '../setting-list/setting-list';
import { useVisible } from '../../../../../hooks/visible';

export function Settings() {
  let { state } = useContext(BootContext);
  let [settingVisible, settingListShow, settingListHide] = useVisible();
  let [shareVisible, shareShow, shareHide] = useVisible();
  return (
    <>
      <div className={`container`}>
        <div className="row">
          <div className={`col ${style['btn']}`}>
            <i className={`${style['share-icon']}`}></i>
            <span className={`${style['text']}`}>分享</span>
          </div>
          <div className={`col ${style['btn']}`} onClick={settingListShow}>
            <i className={`${style['setting-icon']}`}></i>
            <span className={`${style['text']}`}>设置</span>
          </div>
        </div>
      </div>
      <SettingList
        visible={settingVisible}
        onHide={settingListHide}
      ></SettingList>
    </>
  );
}
