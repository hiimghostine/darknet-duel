import React from 'react';
import '../../../styles/power-bar.css';

interface PowerBarProps {
  attackerScore: number;
  defenderScore: number;
  totalInfrastructure: number;
}

/**
 * PowerBar component displays the balance of power between attacker and defender
 * It visualizes which player is currently leading based on infrastructure control
 */
const PowerBar: React.FC<PowerBarProps> = ({ 
  attackerScore, 
  defenderScore,
  totalInfrastructure 
}) => {
  // Calculate percentages for the bar
  const attackerPercent = Math.round((attackerScore / totalInfrastructure) * 100) || 0;
  const defenderPercent = Math.round((defenderScore / totalInfrastructure) * 100) || 0;
  const neutralPercent = 100 - attackerPercent - defenderPercent;
  
  return (
    <div className="power-bar-container">
      <div className="power-bar-label attacker-label">
        <span className="score-value">{attackerScore}</span>
        <span className="role-label">ATTACKER</span>
      </div>
      
      <div className="power-bar">
        <div 
          className="power-bar-segment attacker" 
          style={{ width: `${attackerPercent}%` }}
          title={`Attacker control: ${attackerPercent}%`}
        />
        <div 
          className="power-bar-segment neutral" 
          style={{ width: `${neutralPercent}%` }}
          title={`Neutral territory: ${neutralPercent}%`}
        />
        <div 
          className="power-bar-segment defender" 
          style={{ width: `${defenderPercent}%` }}
          title={`Defender control: ${defenderPercent}%`}
        />
      </div>
      
      <div className="power-bar-label defender-label">
        <span className="role-label">DEFENDER</span>
        <span className="score-value">{defenderScore}</span>
      </div>
    </div>
  );
};

export default PowerBar;
