import React from 'react';
import { Layout, Link } from '@arco-design/web-react';
import { FooterProps } from '@arco-design/web-react/es/Layout/interface';
import cs from 'classnames';
import styles from './style/index.module.less';

function Footer(props: FooterProps = {}) {
  const { className, ...restProps } = props;
  return (
    <>
      <Layout.Footer className={cs(styles.footer, className)} {...restProps}>
        Repo:{' '}
        <Link
          onClick={() => {
            window.ipcRenderer.invoke(
              'openUrl',
              'https://github.com/Arexh/AutoMail'
            );
          }}
        >
          github.com/Arexh/AutoMail
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
