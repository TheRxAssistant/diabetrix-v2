import React from "react";
import styles from "../unified-modal.module.scss";

interface MorePageProps {
  setStep: (step: string) => void;
}

const MorePage: React.FC<MorePageProps> = ({ setStep }) => {
  return (
    <div className={styles.more_page}>
      <div className={styles.more_header}>
        <h2>More Options</h2>
      </div>

      <div className={styles.more_menu_items}>
        <div
          className={styles.more_menu_item}
          onClick={() => setStep("pharmacy_select")}
        >
          <div className={styles.more_menu_icon}>
            <i className="fas fa-pills"></i>
          </div>
          <div className={styles.more_menu_text}>Find Pharmacy</div>
          <i className="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  );
};

export default MorePage;
