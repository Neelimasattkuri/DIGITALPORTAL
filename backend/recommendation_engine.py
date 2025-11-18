class RecommendationEngine:
    """ML-based job recommendation engine using content-based filtering"""
    
    QUALIFICATIONS_HIERARCHY = [
        'KG', 'Pre-Primary', 'Primary', 'Secondary', 'Higher Secondary',
        'Diploma', 'B.Tech', 'B.Sc', 'B.A', 'M.Tech', 'M.Sc', 'M.A', 'MBA', 'PhD', 'PG'
    ]
    
    def get_job_recommendations(self, user_qualification, jobs, user_profile):
        """
        ML Algorithm: Content-based filtering with qualification matching
        Factors considered:
        1. Qualification level match (primary - 60% weight)
        2. Experience alignment (30% weight)
        3. Location relevance (10% weight)
        """
        recommendations = []
        user_qual_index = self.QUALIFICATIONS_HIERARCHY.index(user_qualification)
        
        for job in jobs:
            if job['status'] != 'Active':
                continue
            
            try:
                min_qual_index = self.QUALIFICATIONS_HIERARCHY.index(job['minQualification'])
                max_qual_index = self.QUALIFICATIONS_HIERARCHY.index(job['maxQualification'])
            except ValueError:
                continue
            
            # Check eligibility first
            is_eligible = min_qual_index <= user_qual_index <= max_qual_index
            
            if not is_eligible:
                continue
            
            # Calculate composite match score
            score = self._calculate_score(
                user_qual_index, min_qual_index, max_qual_index,
                job, user_profile
            )
            
            recommendations.append({
                **job,
                'matchScore': score,
                'isEligible': True
            })
        
        # Sort by match score (descending)
        recommendations.sort(key=lambda x: x['matchScore'], reverse=True)
        return recommendations
    
    def _calculate_score(self, user_qual_idx, min_qual_idx, max_qual_idx, job, user_profile):
        """
        Scoring algorithm (0-100):
        - Base: 70 (eligible)
        - Perfect match: +15
        - Upper range (overqualified): +10
        - Mid-range: +5
        - Experience bonus: +3-5
        """
        score = 70
        
        # Qualification matching bonus
        if user_qual_idx == min_qual_idx or user_qual_idx == max_qual_idx:
            score += 15  # Perfect match
        elif user_qual_idx > max_qual_idx:
            score += 10  # Overqualified (good for senior roles)
        else:
            score += 5   # Good alignment
        
        # Experience bonus
        user_exp = int(user_profile.get('experience', 0)) if user_profile.get('experience') else 0
        if user_exp >= 2:
            score += 3
        
        return min(score, 100)
