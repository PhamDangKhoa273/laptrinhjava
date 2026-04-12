<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/entity/Retailer.java
package com.bicap.backend.entity;
=======
package com.bicap.modules.retailer.entity;
import com.bicap.modules.user.entity.User;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/retailer/entity/Retailer.java

import jakarta.persistence.*;

@Entity
@Table(name = "retailers")
public class Retailer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "retailer_id")
    private Long retailerId;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "retailer_code", nullable = false, unique = true, length = 50)
    private String retailerCode;

    @Column(name = "retailer_name", nullable = false, length = 150)
    private String retailerName;

    @Column(name = "business_license_no", nullable = false, unique = true, length = 100)
    private String businessLicenseNo;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    public Long getRetailerId() {
        return retailerId;
    }

    public void setRetailerId(Long retailerId) {
        this.retailerId = retailerId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRetailerCode() {
        return retailerCode;
    }

    public void setRetailerCode(String retailerCode) {
        this.retailerCode = retailerCode;
    }

    public String getRetailerName() {
        return retailerName;
    }

    public void setRetailerName(String retailerName) {
        this.retailerName = retailerName;
    }

    public String getBusinessLicenseNo() {
        return businessLicenseNo;
    }

    public void setBusinessLicenseNo(String businessLicenseNo) {
        this.businessLicenseNo = businessLicenseNo;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

