SEM='QCEvidenceExtractorV5AY -> QCSemanticCoreV124'

def validate_preflight(pf,identity,validated_development_sha):
    assert pf.get('pass') is True
    assert pf.get('validated_development_head_sha')==validated_development_sha
    assert pf.get('semantic_authority')==SEM
    assert pf.get('semantic_change') is False
    assert pf.get('expected_gold_changed') is False
    assert pf.get('semantic_source_identity_pass') is True
    assert pf.get('loaded_semantic_source_count',0)>=55
    assert pf.get('runner_hash_verified') is True
    assert pf.get('runtime_case_timestamp_capture') is True
    assert pf.get('append_only_ledger_contract') is True
    assert pf.get('case_hash_chain_contract') is True
    assert pf.get('provenance_harness_tests_pass') is True
    assert pf.get('transport_pass') is True
    assert identity.get('pass') is True
    assert identity.get('semantic_authority')==SEM
    assert identity.get('all_byte_identical_to_frozen_development') is True
    assert identity.get('loaded_semantic_source_count',0)>=55
    return True
