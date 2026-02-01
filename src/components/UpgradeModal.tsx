import React from 'react';

interface UpgradeModalProps {
  show: boolean;
  onClose: () => void;
  featureName: string;
  requiredPlan: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ show, onClose, featureName, requiredPlan }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-sm w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upgrade Required</h2>
        <p className="text-gray-600 mb-6">
          The <strong>{featureName}</strong> feature is only available on the <strong>{requiredPlan}</strong> plan or higher.
        </p>
        <p className="text-gray-600 mb-6">
          Please upgrade your subscription to access this feature.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-semibold hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => {
              // In a real app, this would redirect to a billing or pricing page
              alert('Redirecting to upgrade page...');
              onClose();
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md font-semibold hover:bg-green-600"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
