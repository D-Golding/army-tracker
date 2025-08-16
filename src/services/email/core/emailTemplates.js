// services/email/core/emailTemplates.js - Detailed HTML email templates
/**
 * Generate detailed achievement digest HTML template
 * @param {string} userName - User's display name
 * @param {Array} achievements - Array of achievements
 * @param {number} totalPoints - Total points earned
 * @param {object} stats - User statistics
 * @returns {string} HTML template
 */
export const generateDetailedAchievementDigestHTML = (userName, achievements, totalPoints, stats) => {
  const isMultiple = achievements.length > 1;

  const achievementCards = achievements.map(achievement => `
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 15px 0;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <div style="font-size: 48px;">${achievement.icon}</div>
        <div>
          <h3 style="margin: 0; color: #92400e; font-size: 20px; font-weight: bold;">${achievement.name}</h3>
          <p style="margin: 5px 0; color: #b45309; font-size: 14px;">${achievement.description}</p>
          <div style="background: #fff; padding: 5px 10px; border-radius: 20px; display: inline-block; margin-top: 8px;">
            <span style="color: #f59e0b; font-weight: bold; font-size: 12px;">⭐ +${achievement.points} points</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">
          🏆 ${isMultiple ? 'Achievements Unlocked!' : 'Achievement Unlocked!'}
        </h1>
        <p style="color: #6b7280; margin: 10px 0;">Hello ${userName}!</p>
      </div>

      <!-- Achievement Cards -->
      ${achievementCards}

      <!-- Summary -->
      <div style="background: #e0f2fe; border: 2px solid #0284c7; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
        <h3 style="color: #0369a1; margin: 0 0 10px 0;">🎉 Fantastic Progress!</h3>
        <p style="color: #0284c7; margin: 5px 0; font-size: 16px;">
          You earned <strong>${totalPoints} points</strong> ${isMultiple ? 'today' : 'with this achievement'}!
        </p>
        ${stats.totalPoints ? `
          <p style="color: #0284c7; margin: 5px 0; font-size: 14px;">
            Total achievement points: <strong>${stats.totalPoints}</strong>
          </p>
        ` : ''}
      </div>

      <!-- Motivation -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 15px 0;">
          Keep up the amazing work! Your dedication to the hobby is inspiring.
        </p>
        <a href="${getAppUrl()}/dashboard/gamification" 
           style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          View All Achievements
        </a>
      </div>

      <!-- Footer -->
      ${getEmailFooter()}
    </div>
  `;
};

/**
 * Generate detailed streak milestone HTML template
 * @param {string} userName - User's display name
 * @param {object} milestone - Streak milestone details
 * @param {object} streakData - Current streak information
 * @returns {string} HTML template
 */
export const generateDetailedStreakMilestoneHTML = (userName, milestone, streakData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f97316; font-size: 32px; margin: 0;">
          🔥 ${milestone.days} Day Streak!
        </h1>
        <p style="color: #6b7280; margin: 10px 0;">Incredible consistency, ${userName}!</p>
      </div>

      <!-- Streak Celebration -->
      <div style="background: linear-gradient(135deg, #fed7aa 0%, #fb923c 100%); border: 3px solid #f97316; border-radius: 16px; padding: 30px; text-align: center; margin: 20px 0;">
        <div style="font-size: 64px; margin-bottom: 15px;">🔥</div>
        <h2 style="color: #ea580c; margin: 0 0 10px 0; font-size: 24px;">
          ${milestone.days} Days of Consistent Activity!
        </h2>
        <p style="color: #c2410c; font-size: 16px; margin: 0;">
          ${milestone.description || `You've been active for ${milestone.days} consecutive days!`}
        </p>
      </div>

      <!-- Streak Stats -->
      <div style="background: #fff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #374151; margin: 0 0 15px 0; text-align: center;">Your Streak Journey</h3>
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="color: #f97316; font-size: 24px; font-weight: bold;">${streakData.current || milestone.days}</div>
            <div style="color: #6b7280; font-size: 12px;">Current Streak</div>
          </div>
          <div>
            <div style="color: #f97316; font-size: 24px; font-weight: bold;">${streakData.longest || milestone.days}</div>
            <div style="color: #6b7280; font-size: 12px;">Longest Streak</div>
          </div>
        </div>
      </div>

      <!-- Next Milestone -->
      ${milestone.nextMilestone ? `
        <div style="background: #f3f4f6; border: 2px solid #d1d5db; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #4b5563; margin: 0 0 10px 0;">🎯 Next Milestone</h3>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Keep going for ${milestone.nextMilestone - milestone.days} more days to reach your ${milestone.nextMilestone} day milestone!
          </p>
        </div>
      ` : ''}

      <!-- Motivation -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 15px 0;">
          Consistency is the key to mastering any craft. You're setting an excellent example!
        </p>
        <a href="${getAppUrl()}/dashboard/gamification" 
           style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          View Your Streaks
        </a>
      </div>

      <!-- Footer -->
      ${getEmailFooter()}
    </div>
  `;
};

/**
 * Generate detailed weekly progress HTML template
 * @param {string} userName - User's display name
 * @param {object} weeklyData - Week's progress data
 * @param {object} communityStats - Community benchmarking data
 * @returns {string} HTML template
 */
export const generateDetailedWeeklyProgressHTML = (userName, weeklyData, communityStats) => {
  const {
    weekStart,
    weekEnd,
    stepsCompleted = 0,
    photosAdded = 0,
    achievementsUnlocked = 0,
    pointsEarned = 0,
    projectsWorkedOn = 0,
    streakDays = 0
  } = weeklyData;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #3b82f6; font-size: 28px; margin: 0;">
          📊 Your Weekly Progress Report
        </h1>
        <p style="color: #6b7280; margin: 10px 0;">
          Hello ${userName}! Here's how your week went.
        </p>
        <p style="color: #9ca3af; font-size: 14px; margin: 5px 0;">
          ${weekStart} - ${weekEnd}
        </p>
      </div>

      <!-- Progress Summary -->
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 25px; margin: 20px 0;">
        <h3 style="color: #1d4ed8; margin: 0 0 20px 0; text-align: center;">This Week's Highlights</h3>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="color: #3b82f6; font-size: 24px; font-weight: bold;">${stepsCompleted}</div>
            <div style="color: #6b7280; font-size: 12px;">Steps Completed</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="color: #3b82f6; font-size: 24px; font-weight: bold;">${photosAdded}</div>
            <div style="color: #6b7280; font-size: 12px;">Photos Added</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="color: #3b82f6; font-size: 24px; font-weight: bold;">${achievementsUnlocked}</div>
            <div style="color: #6b7280; font-size: 12px;">Achievements</div>
          </div>
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="color: #3b82f6; font-size: 24px; font-weight: bold;">${pointsEarned}</div>
            <div style="color: #6b7280; font-size: 12px;">Points Earned</div>
          </div>
        </div>
      </div>

      <!-- Weekly Insights -->
      <div style="background: #fff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #374151; margin: 0 0 15px 0;">📈 Weekly Insights</h3>
        
        <div style="margin-bottom: 15px;">
          <div style="color: #4b5563; font-size: 14px; margin-bottom: 5px;">
            🎯 Projects worked on: <strong>${projectsWorkedOn}</strong>
          </div>
          <div style="color: #4b5563; font-size: 14px; margin-bottom: 5px;">
            🔥 Active days this week: <strong>${streakDays}/7</strong>
          </div>
          ${communityStats.averageSteps ? `
            <div style="color: #4b5563; font-size: 14px; margin-bottom: 5px;">
              📊 Community average: <strong>${communityStats.averageSteps}</strong> steps/week
            </div>
          ` : ''}
        </div>

        ${stepsCompleted > 0 ? `
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="color: #065f46; margin: 0; font-size: 14px;">
              🎉 Great work! You completed ${stepsCompleted} steps this week. 
              ${communityStats.averageSteps && stepsCompleted > communityStats.averageSteps 
                ? 'That\'s above the community average!' 
                : 'Keep up the momentum!'}
            </p>
          </div>
        ` : `
          <div style="background: #fffbeb; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              💡 No steps completed this week. Ready to dive back into your projects?
            </p>
          </div>
        `}
      </div>

      <!-- Call to Action -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 15px 0;">
          Ready to make next week even better?
        </p>
        <a href="${getAppUrl()}/dashboard/projects" 
           style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 0 10px 10px 0;">
          Continue Projects
        </a>
        <a href="${getAppUrl()}/dashboard/gamification" 
           style="background: transparent; color: #3b82f6; border: 2px solid #3b82f6; padding: 10px 22px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          View Progress
        </a>
      </div>

      <!-- Footer -->
      ${getEmailFooter()}
    </div>
  `;
};

/**
 * Generate detailed re-engagement HTML template
 * @param {string} userName - User's display name
 * @param {number} daysInactive - Days since last activity
 * @param {object} userData - User's projects and progress
 * @returns {string} HTML template
 */
export const generateDetailedReEngagementHTML = (userName, daysInactive, userData) => {
  const is30Days = daysInactive >= 30;
  const recentProjects = userData.recentProjects || [];
  const streakData = userData.streakData || {};

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: ${is30Days ? '#dc2626' : '#f59e0b'}; font-size: 28px; margin: 0;">
          ${is30Days ? '😔 We Miss You!' : '⏰ Keep Your Momentum!'}
        </h1>
        <p style="color: #6b7280; margin: 10px 0;">
          Hello ${userName}, it's been ${daysInactive} days since your last activity.
        </p>
      </div>

      <!-- Re-engagement Message -->
      <div style="background: ${is30Days ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'}; border: 2px solid ${is30Days ? '#dc2626' : '#f59e0b'}; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0;">
        <div style="font-size: 48px; margin-bottom: 15px;">${is30Days ? '🎨' : '⚡'}</div>
        <h2 style="color: ${is30Days ? '#991b1b' : '#92400e'}; margin: 0 0 10px 0; font-size: 22px;">
          ${is30Days 
            ? 'Your painting projects are waiting for you!' 
            : 'Don\'t break your momentum!'}
        </h2>
        <p style="color: ${is30Days ? '#b91c1c' : '#b45309'}; font-size: 16px; margin: 0;">
          ${is30Days 
            ? 'The miniatures you were working on are gathering dust. Time to bring them back to life!' 
            : `You've been away for ${daysInactive} days. Jump back in before you lose your creative flow!`}
        </p>
      </div>

      <!-- Projects Waiting -->
      ${recentProjects.length > 0 ? `
        <div style="background: #fff; border: 2px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #374151; margin: 0 0 15px 0;">🎯 Projects Waiting for You</h3>
          
          ${recentProjects.slice(0, 3).map(project => `
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 10px 0;">
              <h4 style="color: #1f2937; margin: 0 0 5px 0; font-size: 16px;">${project.name}</h4>
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                ${project.status === 'in_progress' ? '🔄 In Progress' : '📝 Planning'} • 
                ${project.steps?.length || 0} steps • 
                Last updated ${project.lastUpdated || 'recently'}
              </p>
            </div>
          `).join('')}

          ${recentProjects.length > 3 ? `
            <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0; text-align: center;">
              ...and ${recentProjects.length - 3} more projects ready to continue
            </p>
          ` : ''}
        </div>
      ` : ''}

      <!-- Streak Information -->
      ${streakData.longest > 0 ? `
        <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #92400e; margin: 0 0 10px 0;">🔥 Remember Your Best Streak?</h3>
          <p style="color: #b45309; margin: 0; font-size: 16px;">
            Your longest streak was <strong>${streakData.longest} days</strong>! 
            ${is30Days 
              ? 'You can absolutely achieve that again.' 
              : 'Start a new streak today and beat your record!'}
          </p>
        </div>
      ` : ''}

      <!-- Call to Action -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="color: #4b5563; font-size: 16px; margin: 0 0 15px 0;">
          ${is30Days 
            ? 'Your creative journey is waiting to continue. Take the first step today!' 
            : 'Every expert was once a beginner who never gave up. Keep going!'}
        </p>
        <a href="${getAppUrl()}/dashboard/projects" 
           style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 0 10px 10px 0;">
          Continue Projects
        </a>
        <a href="${getAppUrl()}/dashboard/projects/create" 
           style="background: transparent; color: #3b82f6; border: 2px solid #3b82f6; padding: 10px 22px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
          Start Fresh Project
        </a>
      </div>

      <!-- Footer -->
      ${getEmailFooter()}
    </div>
  `;
};

// =================
// HELPER FUNCTIONS
// =================

/**
 * Get application URL
 * @returns {string} App URL
 */
const getAppUrl = () => {
  return window.location?.origin || 'https://app.tabletoaptactica.com';
};

/**
 * Get common email footer
 * @returns {string} Email footer HTML
 */
const getEmailFooter = () => {
  return `
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; margin-top: 30px;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Keep creating amazing miniatures!<br>
        The Tabletop Tactica Team
      </p>
      <p style="color: #9ca3af; font-size: 10px; margin: 10px 0 0 0;">
        You received this because you have community features enabled. 
        <a href="${getAppUrl()}/dashboard/privacy" style="color: #6b7280;">Manage email preferences</a>
      </p>
    </div>
  `;
};