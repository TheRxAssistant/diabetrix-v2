import React, { useMemo, useState } from "react";
import styles from "./pharmacy-multi-select.module.scss";
import type { Pharmacy } from "../../../data/pharmacies/pharmacies";

interface PharmacyMultiSelectProps {
  pharmacies: Pharmacy[];
  selected: string[];
  onChange: (nextSelected: string[]) => void;
  placeholder?: string;
}

const PharmacyMultiSelect: React.FC<PharmacyMultiSelectProps> = ({
  pharmacies,
  selected,
  onChange,
  placeholder = "Search pharmacies near you...",
}) => {
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pharmacies;
    return pharmacies.filter((p) => p.name.toLowerCase().includes(q));
  }, [query, pharmacies]);

  const isSelected = (name: string) => selected.includes(name);

  const toggle = (name: string) => {
    if (isSelected(name)) {
      onChange(selected.filter((n) => n !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const selectAll = () => {
    const allNames = filtered.map((p) => p.name);
    onChange(Array.from(new Set([...selected, ...allNames])));
  };

  const clearAll = () => onChange([]);
  
  // Get user address from session storage
  const [userAddress, setUserAddress] = React.useState<{
    street?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  } | null>(null);
  
  React.useEffect(() => {
    try {
      const sessionData = sessionStorage.getItem('diabetrix_auth_session');
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        if (parsedData?.user_data?.address) {
          setUserAddress(parsedData.user_data.address);
        }
      }
    } catch (error) {
      console.error('Error retrieving user address from session storage:', error);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.search_input}
          placeholder={placeholder}
          aria-label="Search pharmacies"
        />
      </div>

      {userAddress && (
        <div className={styles.user_address}>
          <i className="fas fa-map-marker-alt"></i>
          <div className={styles.address_content}>
            {userAddress.street ? 
              `${userAddress.street}, ${[userAddress.city, userAddress.state].filter(Boolean).join(', ')}${userAddress.zip_code ? ` ${userAddress.zip_code}` : ''}` :
              `${[userAddress.city, userAddress.state].filter(Boolean).join(', ')}${userAddress.zip_code ? ` ${userAddress.zip_code}` : ''}`
            }
          </div>
        </div>
      )}

      <ul className={styles.list}>
        {filtered.map((p, index) => (
          <li key={p.name} className={styles.item}>
            <label className={styles.item_label}>
              <input
                type="checkbox"
                checked={isSelected(p.name)}
                onChange={() => toggle(p.name)}
              />
              <span className={styles.logo_box}>
                <img src={p.logo} alt={`${p.name} logo`} />
              </span>
              <span className={styles.name}>{p.name}</span>
              {index === 0 && (
                <span className={styles.preferred_tag}>Preferred</span>
              )}
            </label>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className={styles.empty}>No pharmacies match your search.</li>
        )}
      </ul>
    </div>
  );
};

export default PharmacyMultiSelect;
