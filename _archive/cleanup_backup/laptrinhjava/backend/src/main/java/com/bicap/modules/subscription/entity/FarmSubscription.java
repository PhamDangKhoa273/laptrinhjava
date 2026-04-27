package com.bicap.modules.subscription.entity;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.farm.entity.Farm;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "farm_subscriptions")
public class FarmSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private Long subscriptionId;

    @ManyToOne
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private ServicePackage servicePackage;

    @ManyToOne
    @JoinColumn(name = "subscribed_by_user_id", nullable = false)
    private User subscribedByUser;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "subscription_status", nullable = false, length = 30)
    private String subscriptionStatus;

    public Long getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(Long id) { this.subscriptionId = id; }
    public Farm getFarm() { return farm; }
    public void setFarm(Farm farm) { this.farm = farm; }
    public ServicePackage getServicePackage() { return servicePackage; }
    public void setServicePackage(ServicePackage s) { this.servicePackage = s; }
    public User getSubscribedByUser() { return subscribedByUser; }
    public void setSubscribedByUser(User u) { this.subscribedByUser = u; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate d) { this.startDate = d; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate d) { this.endDate = d; }
    public String getSubscriptionStatus() { return subscriptionStatus; }
    public void setSubscriptionStatus(String s) { this.subscriptionStatus = s; }
}
