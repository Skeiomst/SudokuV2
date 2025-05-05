import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Cell = ({
  value,
  row,
  col,
  isInitial,
  isValid,
  correctValue,
  isHighlighted,
  onChange,
  onFocus,
  onBlur
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleChange = (e) => {
    const input = e.target.value;
    if (input === '' || (input.length === 1 && /^[1-9]$/.test(input))) {
      onChange(row, col, input === '' ? 0 : parseInt(input, 10));
      setIsTouched(true);
    }
  };

  const handleFocus = () => {
    onFocus(row, col);
    setShowHint(true);
  };

  const handleBlur = () => {
    onBlur(row, col);
    setShowHint(false);
  };

  const getCellClassName = () => {
    let className = 'cell';
    if (isInitial) className += ' initial';
    if (isHighlighted) className += ' highlighted';
    if (isTouched && value !== 0) {
      className += isValid ? ' valid' : ' invalid';
    }
    return className;
  };

  return (
    <div className={getCellClassName()}>
      {isInitial ? (
        <span className="cell-value">{value}</span>
      ) : (
        <input
          type="text"
          value={value === 0 ? '' : value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength="1"
          className="cell-input"
          disabled={isInitial}
          aria-label={`Celda ${row + 1}, ${col + 1}`}
        />
      )}
      {!isValid && correctValue && showHint && (
        <span className="correct-hint">{correctValue}</span>
      )}
    </div>
  );
};

Cell.propTypes = {
  value: PropTypes.number.isRequired,
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  isInitial: PropTypes.bool.isRequired,
  isValid: PropTypes.bool,
  correctValue: PropTypes.number,
  isHighlighted: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired
};

Cell.defaultProps = {
  isValid: null,
  correctValue: null,
  isHighlighted: false
};

export default React.memo(Cell);