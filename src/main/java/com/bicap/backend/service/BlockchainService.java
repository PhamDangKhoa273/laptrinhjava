package com.bicap.backend.service;

import com.bicap.backend.entity.FarmingSeason;

public interface BlockchainService {
    String saveSeasonToBlockchain(FarmingSeason season);
}
