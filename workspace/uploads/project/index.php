<!-- ================================================================= -->
<!-- ================================================================= -->
<!-- ============ By Mohammed Cha 2023 : Re-skinning GRP ============= -->
<!-- ================================================================= -->
<!-- ================================================================= -->

<?php include_once('inc/re_skinning_header.php'); ?>

<div class="hero-section">
  <div class="s006">
    <form method="post" action="moviesresults.php" id="searchsubmit">
      <div class="hero-logo">
        <img src="imgs/big_logo.png" alt="<?php echo $Re_skinning_Grp_wname; ?>" />
      </div>
      
      <fieldset>
        <h1 class="hero-title">Unlimited Movies</h1>
        <p class="hero-subtitle">Watch anywhere. Cancel anytime. Ready to watch? Enter a movie name to get started.</p>
        
        <div class="search-container">
          <div class="search-input-wrapper">
            <input 
              name="q" 
              id="q" 
              type="text" 
              class="search-input"
              placeholder="Search for movies..." 
              required
            />
            <button class="search-btn" type="submit">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
            <input name="jsonResponse" id="jsonResponse" type="hidden" value="" />
          </div>
        </div>
      </fieldset>
    </form>
  </div>
</div>

<?php if($Re_skinning_Grp_comingsoon == 1): ?>
<div class="content-section">
  <div class="container">
    <h2 class="section-title">Trending Now</h2>
    <p class="section-subtitle">Discover the most popular movies everyone's talking about</p>
    
    <div class="movie-grid">
      <?php
        $str = file_get_contents('https://api.themoviedb.org/3/movie/upcoming?api_key='.$Re_skinning_Grp_ImdbApi);
        $json = json_decode($str, true);
        
        foreach ($json['results'] as $k => $v): 
          if ($v['poster_path'] != null):
            $moviescover = $v['poster_path'];
            $id = $v['id'];
            $title = strlen($v['title']) > 20 ? substr($v['title'], 0, 20).'...' : $v['title'];
            $year = date('Y', strtotime($v['release_date']));
      ?>
        <div class="movie-card fade-in-up">
          <div class="movie-poster">
            <img src="https://www.themoviedb.org/t/p/w500<?php echo $moviescover; ?>" alt="<?php echo $v['title']; ?>" loading="lazy" />
            <div class="movie-overlay">
              <div class="movie-actions">
                <a href="movie.php?id=<?php echo $id; ?>" class="btn-primary">
                  <i class="fas fa-play"></i> Watch Now
                </a>
              </div>
            </div>
          </div>
          
          <div class="movie-info">
            <h3 class="movie-title"><?php echo $title; ?></h3>
            <div class="movie-meta">
              <div class="rating">
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
                <span class="star">★</span>
              </div>
              <span class="availability">Free</span>
            </div>
            <div class="movie-actions">
              <a href="movie.php?id=<?php echo $id; ?>" class="btn-primary">
                <i class="fas fa-eye"></i> View Details
              </a>
            </div>
          </div>
        </div>
      <?php 
          endif;
        endforeach;
      ?>
    </div>
  </div>
</div>
<?php endif; ?>

<script>
// Add scroll effect to navbar
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Add loading animation to search
document.getElementById('searchsubmit').addEventListener('submit', function() {
  const button = document.querySelector('.search-btn');
  button.innerHTML = '<div class="loading">⟳</div>';
});

// Animate cards on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

document.querySelectorAll('.movie-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(30px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(card);
});
</script>

<?php include_once('inc/re_skinning_footer.php'); ?>

<!-- ================================================================= -->
<!-- ================================================================= -->
<!-- ============ By Mohammed Cha 2023 : Re-skinning GRP ============= -->
<!-- ================================================================= -->
<!-- ================================================================= -->