import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';

import TabHeader from '../common/TabHeader';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const SchedulesTab = ({
  schedules,
  isLoading
}) => {
  return (
    <div>
      <TabHeader 
        title="Quản lý lịch trực"
        actionButton={{
          icon: 'Calendar',
          label: 'Đăng ký ca trực',
          to: '/staff/schedules/register'
        }}
      />

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : schedules.length === 0 ? (
        <EmptyState 
          icon="Calendar"
          title="Không có ca trực"
          description="Bạn chưa có ca trực nào."
          actionButton={{
            icon: 'Calendar',
            label: 'Đăng ký ca trực',
            to: '/staff/schedules/register'
          }}
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {schedules.map((schedule) => {
              const shiftDate = new Date(schedule.shift_date);
              const isToday = shiftDate.toDateString() === new Date().toDateString();
              const isPast = shiftDate < new Date() && !isToday;
              const isUpcoming = shiftDate > new Date();

              return (
                <li key={schedule._id}>
                  <div className={`px-4 py-4 ${isToday ? 'bg-green-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isToday ? 'bg-green-100' : 
                            isPast ? 'bg-gray-100' : 
                            'bg-blue-100'
                          }`}>
                            <Clock className={`h-5 w-5 ${
                              isToday ? 'text-green-600' : 
                              isPast ? 'text-gray-600' : 
                              'text-blue-600'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {schedule.shift_type?.shift_name || 'Ca trực'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(schedule.shift_date).toLocaleDateString()} • {schedule.shift_type?.start_time} - {schedule.shift_type?.end_time}
                          </div>
                          {schedule.notes && (
                            <div className="text-xs text-gray-500">
                              Ghi chú: {schedule.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={schedule.status} type="schedule" />
                        {isToday && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Hôm nay
                          </span>
                        )}
                        <Link
                          to={`/staff/schedules/${schedule._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;
