// frontend/src/components/RecommendationCard.jsx
import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLazyLoading } from '../utils/performance';
import FavoritesButton from './FavoritesButton';

const MotionDiv = motion.div;

const RecommendationCard = memo(({ 
  type, // 'hero', 'item', 'build', 'combo'
  data,
  onClick,
  showFavorites = true,
  showDetails = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const config = useMemo(() => ({
    small: { padding: 'p-3', imageSize: 'w-12 h-12', spacing: 'space-y-2' },
    medium: { padding: 'p-4', imageSize: 'w-16 h-16', spacing: 'space-y-3' },
    large: { padding: 'p-6', imageSize: 'w-20 h-20', spacing: 'space-y-4' }
  })[size], [size]);

  // Memoized attribute helpers
  const attributeColor = useMemo(() => ({
    str: 'text-red-400 bg-red-400',
    agi: 'text-green-400 bg-green-400', 
    int: 'text-blue-400 bg-blue-400',
    default: 'text-purple-400 bg-purple-400'
  }), []);

  const attributeIcon = useMemo(() => ({
    str: 'S',
    agi: 'A', 
    int: 'I',
    default: 'U'
  }), []);

  const getAttributeColor = useMemo(() => (attr) => attributeColor[attr] || attributeColor.default, [attributeColor]);
  const getAttributeIcon = useMemo(() => (attr) => attributeIcon[attr] || attributeIcon.default, [attributeIcon]);

  const renderHeroCard = () => (
    <div className="flex space-x-3 items-start">
      <div className="relative flex-shrink-0">
        <MotionDiv
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <LazyImage
            src={data.icon || data.image}
            alt={data.localized_name || data.name}
            className={`${config.imageSize} rounded-md object-cover border-2 border-dota-bg-tertiary hover:border-dota-teal-500 hover:shadow-hero-glow transition-all duration-300`}
            placeholder="/placeholder-hero.svg"
          />
        </MotionDiv>
        {data.primary_attr && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-dota-bg-primary shadow-sm ${getAttributeColor(data.primary_attr)}`}
          >
            {getAttributeIcon(data.primary_attr)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="text-lg font-semibold text-dota-text-primary truncate">
          {data.localized_name || data.name}
        </h3>

        {showDetails && (
          <div className="space-y-1">
            {data.roles && (
              <div>
                <span className="text-sm text-dota-text-muted">Roles: </span>
                <div className="inline-flex flex-wrap gap-1 ml-1">
                  {data.roles.slice(0, 2).map((role, index) => (
                    <span
                      key={index}
                      className="bg-dota-teal-500 text-white text-xs px-2 py-0.5 rounded-md font-medium"
                    >
                      {role}
                    </span>
                  ))}
                  {data.roles.length > 2 && (
                    <span className="border border-dota-text-muted text-dota-text-muted text-xs px-2 py-0.5 rounded-md">
                      +{data.roles.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {data.difficulty && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-dota-text-muted">Difficulty:</span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full border ${
                        i < data.difficulty 
                          ? 'bg-yellow-400 border-yellow-500' 
                          : 'bg-dota-bg-tertiary border-dota-bg-hover'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {data.winrate && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-dota-text-muted">Win Rate:</span>
                <span className={`text-sm font-medium ${data.winrate >= 50 ? 'text-dota-status-success' : 'text-dota-status-error'}`}>
                  {data.winrate.toFixed(1)}%
                </span>
                <div className="w-12 h-2 bg-dota-bg-tertiary rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${data.winrate >= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${data.winrate}%` }}
                  />
                </div>
              </div>
            )}

            {data.reason && (
              <div className="bg-dota-teal-500/10 text-dota-teal-300 text-sm italic px-2 py-1 rounded-md border border-dota-teal-500">
                {data.reason}
              </div>
            )}
          </div>
        )}
      </div>

      {showFavorites && (
        <div className="flex-shrink-0">
          <FavoritesButton
            type="hero"
            id={data.id || data.hero_id}
            name={data.localized_name || data.name}
            role={data.roles?.[0]}
          />
        </div>
      )}
    </div>
  );

  const renderItemCard = () => (
    <div className="flex space-x-3 items-start">
      <div className="relative flex-shrink-0">
        <MotionDiv
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <img
            src={data.icon || data.image}
            alt={data.dname || data.name}
            className={`${config.imageSize} rounded-md object-cover bg-dota-bg-hover border-2 border-dota-bg-tertiary hover:border-yellow-400 hover:shadow-item-glow transition-all duration-300`}
          />
        </MotionDiv>
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="text-lg font-semibold text-dota-text-primary truncate">
          {data.dname || data.name}
        </h3>

        {showDetails && (
          <div className="space-y-1">
            {data.cost && (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-yellow-400 font-medium">Cost:</span>
                <span className="text-sm text-yellow-300 font-bold">{data.cost}</span>
                <span className="text-xs text-yellow-500">gold</span>
              </div>
            )}

            {data.category && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-dota-text-muted">Category:</span>
                <span className="bg-dota-purple-500 text-white text-xs px-2 py-0.5 rounded-md">
                  {data.category}
                </span>
              </div>
            )}

            {data.description && (
              <div className="text-xs text-dota-text-muted bg-dota-bg-hover p-2 rounded-md border border-dota-bg-tertiary">
                {data.description.slice(0, 100)}...
              </div>
            )}

            {data.reason && (
              <div className="bg-dota-teal-500/10 text-dota-teal-300 text-sm italic px-2 py-1 rounded-md border border-dota-teal-500">
                {data.reason}
              </div>
            )}
          </div>
        )}
      </div>

      {showFavorites && (
        <div className="flex-shrink-0">
          <FavoritesButton
            type="item"
            id={data.id || data.item_id}
            name={data.dname || data.name}
            category={data.category}
          />
        </div>
      )}
    </div>
  );

  const renderBuildCard = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-dota-text-primary truncate">
          {data.name || 'Item Build'}
        </h3>
        {data.situation && (
          <span className="bg-dota-darkBlue-500 text-white text-xs px-2 py-1 rounded-full">
            {data.situation}
          </span>
        )}
      </div>

      {showDetails && (
        <div className="space-y-2">
          {data.items && (
            <div className="flex flex-wrap gap-1">
              {data.items.slice(0, 6).map((item, index) => (
                <MotionDiv
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    title={item.name}
                    className="w-8 h-8 rounded-md border border-dota-bg-tertiary hover:border-yellow-400 hover:shadow-item-glow transition-all duration-200"
                  />
                </MotionDiv>
              ))}
              {data.items.length > 6 && (
                <div className="w-8 h-8 rounded-md border border-dota-bg-tertiary bg-dota-bg-hover flex items-center justify-center text-xs text-dota-text-muted font-medium">
                  +{data.items.length - 6}
                </div>
              )}
            </div>
          )}

          {data.total_cost && (
            <div className="flex items-center space-x-1">
              <span className="text-sm text-yellow-400 font-medium">Total Cost:</span>
              <span className="text-sm text-yellow-300 font-bold">{data.total_cost}</span>
              <span className="text-xs text-yellow-500">gold</span>
            </div>
          )}

          {data.description && (
            <div className="text-sm text-dota-text-muted bg-dota-bg-hover p-2 rounded-md border border-dota-bg-tertiary">
              {data.description}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderComboCard = () => (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-dota-text-primary">
        {data.name || 'Hero Combo'}
      </h3>

      {showDetails && (
        <div className="space-y-2">
          {data.heroes && (
            <div className="flex items-center space-x-2 flex-wrap">
              {data.heroes.map((hero, index) => (
                <React.Fragment key={index}>
                  <MotionDiv
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <img
                      src={hero.icon}
                      alt={hero.name}
                      title={hero.name}
                      className="w-8 h-8 rounded-full border-2 border-dota-bg-tertiary hover:border-dota-teal-500 hover:shadow-hero-glow transition-all duration-200"
                    />
                  </MotionDiv>
                  {index < data.heroes.length - 1 && (
                    <span className="text-dota-text-muted text-lg font-bold">+</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {data.synergy_rating && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-dota-text-muted">Synergy:</span>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full border ${
                      i < data.synergy_rating 
                        ? 'bg-dota-status-success border-green-500 shadow-sm' 
                        : 'bg-dota-bg-tertiary border-dota-bg-hover'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-dota-status-success font-medium">
                {data.synergy_rating}/5
              </span>
            </div>
          )}

          {data.description && (
            <div className="text-sm text-dota-text-muted bg-dota-bg-hover p-2 rounded-md border border-dota-bg-tertiary">
              {data.description}
            </div>
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
    <MotionDiv
      className={`
        bg-card-gradient border-2 border-dota-bg-tertiary rounded-lg overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        hover:border-dota-teal-500 hover:shadow-card-hover hover:-translate-y-0.5
        active:translate-y-0 transition-all duration-300 ease-in-out
        backdrop-blur-md relative
        focus:outline-none focus:ring-2 focus:ring-dota-teal-500 focus:ring-offset-2 focus:ring-offset-dota-bg-primary
        before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5
        before:bg-hero-gradient before:opacity-0 before:transition-opacity before:duration-300
        hover:before:opacity-100
        ${config.padding}
      `}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
    >
      {renderContent()}
    </MotionDiv>
  );
});

RecommendationCard.displayName = 'RecommendationCard';

export default RecommendationCard;