import React from "react";

const Card = ({ children, title, accentColor = "rgba(0,0,0,0.5)", maxWidth = 480 }) => {
  return (
    <div style={{...styles.card, maxWidth }}>
      {title && (
        <div style={{ ...styles.header, backgroundColor: accentColor }}>
          {title}
        </div>
      )}

      <div style={styles.body}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    margin: 12,
    overflow: "hidden",
  },
  header: {
    color: "#fff",
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: 14,
  },
  body: {
    padding: 14,
  },
};


export default React.memo(Card);
