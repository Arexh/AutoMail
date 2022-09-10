import React from 'react';
import { Layout, Link } from '@arco-design/web-react';
import { FooterProps } from '@arco-design/web-react/es/Layout/interface';
import cs from 'classnames';
import styles from './style/index.module.less';
import packageJson from '@/../package.json';
import isElectron from 'is-electron';

function Footer(props: FooterProps = {}) {
  const { className, ...restProps } = props;
  return (
    <>
      <Layout.Footer className={cs(styles.footer, className)} {...restProps}>
        Repo:{' '}
        <Link
          onClick={() => {
            if (isElectron()) {
              window.ipcRenderer.invoke(
                'openUrl',
                'https://github.com/Arexh/AutoMail'
              );
            } else {
              window
                .open('https://github.com/Arexh/AutoMail', '_blank')
                .focus();
            }
          }}
        >
          github.com/Arexh/AutoMail (v{packageJson.version})
        </Link>
      </Layout.Footer>
      <Layout.Footer
        style={{ marginTop: -16 }}
        className={cs(styles.footer, className)}
        {...restProps}
      >
        Arco Design Pro
      </Layout.Footer>
    </>
  );
}

export default Footer;
