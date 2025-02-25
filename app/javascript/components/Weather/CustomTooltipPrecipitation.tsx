import React from 'react';

export const CustomTooltipTemperature = ({ payload }) => {
  console.log(payload)
  return (
    <div className="bg-night text-cream p-2">
      {payload.map((item) => {
        return (
          <div key={item.dataKey}>
            <strong>{item.dataKey}</strong>: {`${item.value}%`}
          </div>
        );
      })}
    </div>
  );
}

export default CustomTooltipTemperature;