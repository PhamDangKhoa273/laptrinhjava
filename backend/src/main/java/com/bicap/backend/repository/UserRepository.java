<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/repository/UserRepository.java
package com.bicap.backend.repository;

import com.bicap.backend.entity.User;
=======
package com.bicap.modules.user.repository;
import com.bicap.modules.user.entity.User;

>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/user/repository/UserRepository.java
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<User> findByEmailIgnoreCase(String email);
}
