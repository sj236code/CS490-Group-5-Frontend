/* 
return (
        <div className="discount-item">
            <div className="discount-left">
                <input
                    type="checkbox"
                    className="discount-checkbox"
                    checked={checked}
                    onChange={() => onToggle(id)}
                />

                <div className="discount-text">
                    <div className="discount-salon">{salon}</div>
                    <div className="discount-points">{pointsInfo}</div>
                </div>
            </div>

            <div className="discount-amount">
                {amount > 0 ? `-$${amount}` : ""}
            </div>
        </div>
    );
*/

import React from "react";
import "./DiscountItem.css";

export default function DiscountItem({
    id,
    salon,
    pointsInfo,
    amount,
    checked,
    onToggle
}) {
    return (
        <div className="discount-item">
            <input
                type="checkbox"
                className="discount-checkbox"
                checked={checked}
                onChange={() => onToggle(id)}
            />
            <div className="border">
                <div className="discount-info">
                    <div className="discount-salon">{salon}</div>
                    <div className="discount-points">{pointsInfo}</div>

                </div>

                <div className="discount-amount">
                    {amount > 0 ? `-$${amount}` : "- $0"}
                </div>
            </div>
                
        </div>
    );
}
