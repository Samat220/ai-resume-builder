"use client";

import { useState } from 'react';
import { BulletPointPool } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface BulletPointManagerProps {
  bulletPool: BulletPointPool[];
  setBulletPool: (bullets: BulletPointPool[]) => void;
}

export default function BulletPointManager({
  bulletPool,
  setBulletPool,
}: BulletPointManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newBullet, setNewBullet] = useState({
    category: 'technical' as BulletPointPool['category'],
    content: '',
    skills: '',
    impact: '',
  });

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'technical', label: 'Technical' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'achievement', label: 'Achievement' },
    { id: 'project', label: 'Project' },
    { id: 'soft-skill', label: 'Soft Skills' },
  ];

  const filteredBullets = selectedCategory === 'all'
    ? bulletPool
    : bulletPool.filter(bullet => bullet.category === selectedCategory);

  const addBullet = () => {
    if (!newBullet.content.trim()) return;

    const bullet: BulletPointPool = {
      id: generateId(),
      category: newBullet.category,
      content: newBullet.content.trim(),
      skills: newBullet.skills.split(',').map(s => s.trim()).filter(s => s),
      impact: newBullet.impact.trim() || undefined,
    };

    setBulletPool([...bulletPool, bullet]);
    setNewBullet({
      category: 'technical' as BulletPointPool['category'],
      content: '',
      skills: '',
      impact: '',
    });
  };


  const removeBullet = (id: string) => {
    setBulletPool(bulletPool.filter(bullet => bullet.id !== id));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      leadership: 'bg-purple-100 text-purple-800',
      achievement: 'bg-green-100 text-green-800',
      project: 'bg-orange-100 text-orange-800',
      'soft-skill': 'bg-pink-100 text-pink-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Content Pool Manager</h2>
        <div className="text-sm text-gray-600">
          {filteredBullets.length} bullet points
        </div>
      </div>

      {/* Add New Bullet Point */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Add New Bullet Point</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newBullet.category}
              onChange={(e) => setNewBullet({ ...newBullet, category: e.target.value as BulletPointPool['category'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="technical">Technical</option>
              <option value="leadership">Leadership</option>
              <option value="achievement">Achievement</option>
              <option value="project">Project</option>
              <option value="soft-skill">Soft Skills</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              value={newBullet.content}
              onChange={(e) => setNewBullet({ ...newBullet, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              rows={3}
              placeholder="Describe your achievement, responsibility, or contribution with specific metrics when possible..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relevant Skills
              </label>
              <input
                type="text"
                value={newBullet.skills}
                onChange={(e) => setNewBullet({ ...newBullet, skills: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Python, React, API Design"
              />
              <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Impact/Result
              </label>
              <input
                type="text"
                value={newBullet.impact}
                onChange={(e) => setNewBullet({ ...newBullet, impact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="30% performance improvement"
              />
            </div>
          </div>

          <button
            onClick={addBullet}
            disabled={!newBullet.content.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Bullet Point
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.label}
                {category.id === 'all' && (
                  <span className="ml-2 bg-gray-100 text-gray-900 text-xs rounded-full px-2 py-1">
                    {bulletPool.length}
                  </span>
                )}
                {category.id !== 'all' && (
                  <span className="ml-2 bg-gray-100 text-gray-900 text-xs rounded-full px-2 py-1">
                    {bulletPool.filter(b => b.category === category.id).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bullet Points List */}
        <div className="p-6 space-y-4">
          {filteredBullets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedCategory === 'all'
                ? 'No bullet points added yet. Add your first one above!'
                : `No ${selectedCategory} bullet points found.`}
            </div>
          ) : (
            filteredBullets.map((bullet) => (
              <div key={bullet.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bullet.category)}`}>
                    {bullet.category}
                  </span>
                  <button
                    onClick={() => removeBullet(bullet.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-3">
                  <p className="text-gray-900">{bullet.content}</p>
                </div>

                <div className="space-y-2">
                  {bullet.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-600 mr-2">Skills:</span>
                      {bullet.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {bullet.impact && (
                    <div className="text-sm">
                      <span className="text-gray-600">Impact: </span>
                      <span className="text-green-600 font-medium">{bullet.impact}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">💡</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-900">Tips for Effective Bullet Points</h4>
            <ul className="mt-2 text-sm text-yellow-800 space-y-1">
              <li>• Start with strong action verbs (Built, Implemented, Led, Optimized)</li>
              <li>• Include specific metrics and results when possible</li>
              <li>• Focus on impact and value delivered to the organization</li>
              <li>• Keep each bullet point to 1-2 lines for better readability</li>
              <li>• Tag with relevant skills to improve AI matching</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}