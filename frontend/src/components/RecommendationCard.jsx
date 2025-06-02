// frontend/src/components/RecommendationCard.jsx
import React from 'react';
import FavoritesButton from './FavoritesButton';

const RecommendationCard = ({ 
  type, // 'hero', 'item', 'build', 'combo'
  data,
  onClick,
  showFavorites = true,
  showDetails = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const sizeClasses = {
    small: 'p-3',
    medium: 'p-4',
    large: 'p-6'
  };

  const imageClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  };

  const renderHeroCard = () => (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 relative">
        <img 
          src={data.icon || data.image} 
          alt={data.localized_name || data.name}
          className={`${imageClasses[size]} rounded-md object-cover`}
        />
        {data.primary_attr && (
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-xs font-bold text-white flex items-center justify-center
            ${data.primary_attr === 'str' ? 'bg-red-500' : 
              data.primary_attr === 'agi' ? 'bg-green-500' : 
              data.primary_attr === 'int' ? 'bg-blue-500' : 'bg-purple-500'}`}>
            {data.primary_attr === 'str' ? 'S' : 
             data.primary_attr === 'agi' ? 'A' : 
             data.primary_attr === 'int' ? 'I' : 'U'}
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {data.localized_name || data.name}
        </h3>
        {showDetails && (
          <div className="space-y-1">
            {data.roles && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Roles:</span> {data.roles.slice(0, 2).join(', ')}
                {data.roles.length > 2 && ` +${data.roles.length - 2} more`}
              </p>
            )}
            {data.difficulty && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Difficulty:</span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < data.difficulty ? 'bg-yellow-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
            {data.winrate && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Win Rate:</span> 
                <span className={`ml-1 ${data.winrate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.winrate.toFixed(1)}%
                </span>
              </p>
            )}
            {data.reason && (
              <p className="text-sm text-blue-600 italic">{data.reason}</p>
            )}
          </div>
        )}
      </div>
      
      {showFavorites && (
        <FavoritesButton
          type="hero"
          id={data.id || data.hero_id}
          name={data.localized_name || data.name}
          role={data.roles?.[0]}
        />
      )}
    </div>
  );

  const renderItemCard = () => (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        <img 
          src={data.icon || data.image} 
          alt={data.dname || data.name}
          className={`${imageClasses[size]} rounded-md object-cover bg-gray-100`}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {data.dname || data.name}
        </h3>
        {showDetails && (
          <div className="space-y-1">
            {data.cost && (
              <p className="text-sm text-yellow-600 font-medium">
                Cost: {data.cost} gold
              </p>
            )}
            {data.category && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Category:</span> {data.category}
              </p>
            )}
            {data.description && (
              <p className="text-xs text-gray-500 line-clamp-2">
                {data.description}
              </p>
            )}
            {data.reason && (
              <p className="text-sm text-blue-600 italic">{data.reason}</p>
            )}
          </div>
        )}
      </div>
      
      {showFavorites && (
        <FavoritesButton
          type="item"
          id={data.id || data.item_id}
          name={data.dname || data.name}
          category={data.category}
        />
      )}
    </div>
  );

  const renderBuildCard = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {data.name || 'Item Build'}
        </h3>
        {data.situation && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            {data.situation}
          </span>
        )}
      </div>
      
      {showDetails && (
        <div className="space-y-2">
          {data.items && (
            <div className="flex flex-wrap gap-1">
              {data.items.slice(0, 6).map((item, index) => (
                <img
                  key={index}
                  src={item.icon}
                  alt={item.name}
                  className="w-8 h-8 rounded border border-gray-200"
                  title={item.name}
                />
              ))}
              {data.items.length > 6 && (
                <div className="w-8 h-8 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-600">
                  +{data.items.length - 6}
                </div>
              )}
            </div>
          )}
          
          {data.total_cost && (
            <p className="text-sm text-yellow-600 font-medium">
              Total Cost: {data.total_cost} gold
            </p>
          )}
          
          {data.description && (
            <p className="text-sm text-gray-600">{data.description}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderComboCard = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">
        {data.name || 'Hero Combo'}
      </h3>
      
      {showDetails && (
        <div className="space-y-2">
          {data.heroes && (
            <div className="flex space-x-2">
              {data.heroes.map((hero, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <img
                    src={hero.icon}
                    alt={hero.name}
                    className="w-8 h-8 rounded"
                    title={hero.name}
                  />
                  {index < data.heroes.length - 1 && (
                    <span className="text-gray-400">+</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {data.synergy_rating && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Synergy:</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < data.synergy_rating ? 'bg-green-400' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {data.description && (
            <p className="text-sm text-gray-600">{data.description}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'hero':
        return renderHeroCard();
      case 'item':
        return renderItemCard();
      case 'build':
        return renderBuildCard();
      case 'combo':
        return renderComboCard();
      default:
        return <div>Unknown recommendation type</div>;
    }
  };

  return (
    <div 
      className={`
        bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 
        ${onClick ? 'cursor-pointer hover:border-blue-300' : ''} 
        ${sizeClasses[size]}
      `}
      onClick={onClick}
    >
      {renderContent()}
    </div>
  );
};

export default RecommendationCard;