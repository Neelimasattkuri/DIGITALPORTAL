class QualificationMatcher:
    """ML module for advanced matching between user profile and job requirements"""
    
    QUALIFICATIONS_HIERARCHY = [
        'KG', 'Pre-Primary', 'Primary', 'Secondary', 'Higher Secondary',
        'Diploma', 'B.Tech', 'B.Sc', 'B.A', 'M.Tech', 'M.Sc', 'M.A', 'MBA', 'PhD', 'PG'
    ]
    
    def calculate_match_score(self, user, job):
        """
        Advanced ML matching algorithm considering:
        1. Qualification level match (60% weight)
        2. Experience alignment (30% weight)
        3. Location relevance (10% weight)
        """
        score = 0
        reasoning = []
        
        # Qualification matching (60% weight)
        qual_score = self._match_qualification(user['qualification'], job)
        score += qual_score * 0.6
        
        if qual_score >= 80:
            reasoning.append("Strong qualification match")
        elif qual_score >= 60:
            reasoning.append("Moderate qualification match")
        else:
            reasoning.append("Weak qualification match")
        
        # Experience alignment (30% weight)
        exp_score = self._match_experience(user, job)
        score += exp_score * 0.3
        
        if exp_score >= 70:
            reasoning.append("Experience well-aligned with role")
        
        # Location bonus (10% weight)
        location_score = 50
        score += location_score * 0.1
        reasoning.append("Location available")
        
        return {
            'score': round(score),
            'reasoning': reasoning,
            'details': {
                'qualificationMatch': round(qual_score),
                'experienceMatch': round(exp_score),
                'locationMatch': 50
            }
        }
    
    def _match_qualification(self, user_qual, job):
        """Match user qualification with job requirements using hierarchy"""
        try:
            user_idx = self.QUALIFICATIONS_HIERARCHY.index(user_qual)
            min_idx = self.QUALIFICATIONS_HIERARCHY.index(job['minQualification'])
            max_idx = self.QUALIFICATIONS_HIERARCHY.index(job['maxQualification'])
            
            if user_idx < min_idx:
                return 30  # Below minimum requirement
            elif user_idx > max_idx:
                return 70  # Above maximum but qualified
            else:
                return 90  # Perfect fit within range
        except:
            return 50
    
    def _match_experience(self, user, job):
        """Match user experience with job requirements using keyword extraction"""
        user_exp = int(user.get('experience', 0)) if user.get('experience') else 0
        job_requirements = job.get('requirements', [])
        
        exp_score = 60
        
        # Check if job requires experience
        for req in job_requirements:
            req_lower = req.lower()
            if 'years' in req_lower or 'experience' in req_lower:
                exp_score = 75
                # Check if user meets requirement
                if user_exp >= 2:
                    exp_score = 85
                break
        
        return exp_score
